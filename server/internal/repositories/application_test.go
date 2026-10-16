package repositories

import (
	"errors"
	"testing"
	"time"

	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func newTestApplicationRepository(t *testing.T) (*ApplicationRepository, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open test database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("get underlying test database: %v", err)
	}
	sqlDB.SetMaxOpenConns(1)
	t.Cleanup(func() {
		if err := sqlDB.Close(); err != nil {
			t.Errorf("close test database: %v", err)
		}
	})

	if err := db.AutoMigrate(&models.SavedApplication{}, &models.ApplicationSkill{}, &models.Skill{}); err != nil {
		t.Fatalf("migrate test database: %v", err)
	}

	return NewApplicationRepository(db), db
}

func TestNewApplicationRepository(t *testing.T) {
	repo, _ := newTestApplicationRepository(t)
	if repo == nil || repo.db == nil {
		t.Fatal("NewApplicationRepository() returned a repository without a database")
	}
}

func TestApplicationRepository_List(t *testing.T) {
	t.Run("empty table", func(t *testing.T) {
		repo, _ := newTestApplicationRepository(t)

		got, err := repo.List()
		if err != nil {
			t.Fatalf("List() error = %v", err)
		}
		if got == nil || len(*got) != 0 {
			t.Fatalf("List() = %v, want a non-nil empty slice", got)
		}
	})

	t.Run("returns selected application fields", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		want := []models.SavedApplication{
			{
				ID:         "application-1",
				CreateDate: 1700000000,
				Application: models.Application{
					Name:     "Engineer",
					Company:  "Example Co",
					Position: "Backend Engineer",
					Status:   models.Applied,
				},
			},
			{
				ID:         "application-2",
				CreateDate: 1700000100,
				Application: models.Application{
					Name:     "Developer",
					Company:  "Another Co",
					Position: "Frontend Engineer",
					Status:   models.Saved,
				},
			},
		}
		if err := db.Create(&want).Error; err != nil {
			t.Fatalf("seed applications: %v", err)
		}

		got, err := repo.List()
		if err != nil {
			t.Fatalf("List() error = %v", err)
		}
		if len(*got) != len(want) {
			t.Fatalf("List() returned %d rows, want %d", len(*got), len(want))
		}
		byID := make(map[string]models.SavedApplication, len(*got))
		for _, item := range *got {
			byID[item.ID] = item
		}
		for _, item := range want {
			gotItem, ok := byID[item.ID]
			if !ok {
				t.Errorf("List() missing application %q", item.ID)
				continue
			}
			if gotItem.Name != item.Name || gotItem.Company != item.Company ||
				gotItem.Status != item.Status || gotItem.CreateDate != item.CreateDate {
				t.Errorf("List() application %q selected fields = %+v, want %+v", item.ID, gotItem, item)
			}
			if gotItem.Position != "" {
				t.Errorf("List() application %q Position = %q, want empty because it is not selected", item.ID, gotItem.Position)
			}
		}
	})

	t.Run("database error", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		if err := db.Migrator().DropTable(&models.SavedApplication{}); err != nil {
			t.Fatalf("drop application table: %v", err)
		}

		if _, err := repo.List(); err == nil {
			t.Fatal("List() error = nil, want an error for a missing table")
		}
	})
}

func TestApplicationRepository_Create(t *testing.T) {
	t.Run("persists application with generated ID and timestamp", func(t *testing.T) {
		repo, _ := newTestApplicationRepository(t)
		application := models.Application{
			Name:     "Engineer",
			Company:  "Example Co",
			Position: "Backend Engineer",
			Status:   models.Applied,
		}
		before := time.Now().Unix()

		got, err := repo.Create(application)
		if err != nil {
			t.Fatalf("Create() error = %v", err)
		}
		after := time.Now().Unix()
		if got.ID == "" {
			t.Fatal("Create() returned an empty ID")
		}
		if _, err := uuid.Parse(got.ID); err != nil {
			t.Errorf("Create() ID = %q, want UUID: %v", got.ID, err)
		}
		if got.CreateDate < before || got.CreateDate > after {
			t.Errorf("Create() CreateDate = %d, want timestamp between %d and %d", got.CreateDate, before, after)
		}
		if got.Application != application {
			t.Errorf("Create() application = %+v, want %+v", got.Application, application)
		}

		saved, err := repo.GetByID(got.ID)
		if err != nil {
			t.Fatalf("GetByID(%q) error = %v", got.ID, err)
		}
		if saved.ID != got.ID || saved.CreateDate != got.CreateDate || saved.Application != application {
			t.Errorf("persisted application = %+v, want %+v", saved, got)
		}
	})

	t.Run("insert error", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		if err := db.Exec(`
			CREATE TRIGGER reject_application BEFORE INSERT ON application
			BEGIN SELECT RAISE(ABORT, 'rejected application'); END;
		`).Error; err != nil {
			t.Fatalf("create rejecting trigger: %v", err)
		}

		if _, err := repo.Create(models.Application{Name: "Engineer"}); err == nil {
			t.Fatal("Create() error = nil, want insert error")
		}
	})
}

func TestApplicationRepository_GetByID(t *testing.T) {
	repo, db := newTestApplicationRepository(t)
	want := models.SavedApplication{
		ID:         "application-1",
		CreateDate: 1700000000,
		Application: models.Application{
			Name:     "Engineer",
			Company:  "Example Co",
			Position: "Backend Engineer",
			Status:   models.Interviewing,
		},
	}
	if err := db.Create(&want).Error; err != nil {
		t.Fatalf("seed application: %v", err)
	}

	t.Run("existing ID", func(t *testing.T) {
		got, err := repo.GetByID(want.ID)
		if err != nil {
			t.Fatalf("GetByID() error = %v", err)
		}
		if *got != want {
			t.Errorf("GetByID() = %+v, want %+v", *got, want)
		}
	})

	t.Run("unknown ID", func(t *testing.T) {
		if _, err := repo.GetByID("missing"); !errors.Is(err, gorm.ErrRecordNotFound) {
			t.Errorf("GetByID() error = %v, want %v", err, gorm.ErrRecordNotFound)
		}
	})

	t.Run("database error", func(t *testing.T) {
		if err := db.Migrator().DropTable(&models.SavedApplication{}); err != nil {
			t.Fatalf("drop application table: %v", err)
		}
		if _, err := repo.GetByID(want.ID); err == nil {
			t.Fatal("GetByID() error = nil, want an error for a missing table")
		}
	})
}

func TestApplicationRepository_SetSkills(t *testing.T) {
	t.Run("replaces existing links", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		seed := []models.ApplicationSkill{
			{ApplicationID: "application-1", SkillID: "old-1"},
			{ApplicationID: "application-1", SkillID: "old-2"},
			{ApplicationID: "application-2", SkillID: "unrelated"},
		}
		if err := db.Create(&seed).Error; err != nil {
			t.Fatalf("seed application skills: %v", err)
		}
		newSkills := []models.Skill{{ID: "new-1"}, {ID: "new-2"}}

		if err := repo.SetSkills(newSkills, "application-1"); err != nil {
			t.Fatalf("SetSkills() error = %v", err)
		}

		var got []models.ApplicationSkill
		if err := db.Order("application_id, skill_id").Find(&got).Error; err != nil {
			t.Fatalf("read application skills: %v", err)
		}
		want := []models.ApplicationSkill{
			{ApplicationID: "application-1", SkillID: "new-1"},
			{ApplicationID: "application-1", SkillID: "new-2"},
			{ApplicationID: "application-2", SkillID: "unrelated"},
		}
		if len(got) != len(want) {
			t.Fatalf("application skills = %+v, want %+v", got, want)
		}
		for i := range want {
			if got[i] != want[i] {
				t.Errorf("application skills[%d] = %+v, want %+v", i, got[i], want[i])
			}
		}
	})

	t.Run("empty skills clears existing links", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		if err := db.Create(&models.ApplicationSkill{ApplicationID: "application-1", SkillID: "old"}).Error; err != nil {
			t.Fatalf("seed application skill: %v", err)
		}

		if err := repo.SetSkills(nil, "application-1"); err != nil {
			t.Fatalf("SetSkills() error = %v", err)
		}

		var got []models.ApplicationSkill
		if err := db.Where("application_id = ?", "application-1").Find(&got).Error; err != nil {
			t.Fatalf("read application skills: %v", err)
		}
		if len(got) != 0 {
			t.Errorf("application skills = %+v, want none", got)
		}
	})

	t.Run("empty skills with no existing links succeeds", func(t *testing.T) {
		repo, _ := newTestApplicationRepository(t)
		if err := repo.SetSkills([]models.Skill{}, "application-1"); err != nil {
			t.Errorf("SetSkills() error = %v, want nil", err)
		}
	})

	t.Run("insert error rolls back deletion", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		original := models.ApplicationSkill{ApplicationID: "application-1", SkillID: "old"}
		if err := db.Create(&original).Error; err != nil {
			t.Fatalf("seed application skill: %v", err)
		}
		if err := db.Exec(`
			CREATE TRIGGER reject_skill BEFORE INSERT ON application_skill
			WHEN NEW.skill_id = 'reject'
			BEGIN SELECT RAISE(ABORT, 'rejected skill'); END;
		`).Error; err != nil {
			t.Fatalf("create rejecting trigger: %v", err)
		}

		err := repo.SetSkills([]models.Skill{{ID: "reject"}}, "application-1")
		if err == nil {
			t.Fatal("SetSkills() error = nil, want insert error")
		}

		var got []models.ApplicationSkill
		if err := db.Where("application_id = ?", "application-1").Find(&got).Error; err != nil {
			t.Fatalf("read application skills: %v", err)
		}
		if len(got) != 1 || got[0] != original {
			t.Errorf("application skills after rollback = %+v, want [%+v]", got, original)
		}
	})
}

func TestApplicationRepository_Update(t *testing.T) {
	t.Run("updates requested fields and preserves others", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		application := models.SavedApplication{
			ID: "application-1",
			Application: models.Application{
				Name:     "Old name",
				Company:  "Example Co",
				Position: "Backend Engineer",
				Status:   models.Saved,
			},
		}
		if err := db.Create(&application).Error; err != nil {
			t.Fatalf("seed application: %v", err)
		}

		if err := repo.Update(application.ID, map[string]any{"name": "New name", "status": models.Applied}); err != nil {
			t.Fatalf("Update() error = %v", err)
		}
		got, err := repo.GetByID(application.ID)
		if err != nil {
			t.Fatalf("GetByID() error = %v", err)
		}
		if got.Name != "New name" || got.Status != models.Applied {
			t.Errorf("updated fields = name %q, status %q; want name %q, status %q", got.Name, got.Status, "New name", models.Applied)
		}
		if got.Company != application.Company || got.Position != application.Position {
			t.Errorf("unchanged fields = company %q, position %q; want %q, %q", got.Company, got.Position, application.Company, application.Position)
		}
	})

	t.Run("unknown ID succeeds", func(t *testing.T) {
		repo, _ := newTestApplicationRepository(t)
		if err := repo.Update("missing", map[string]any{"name": "Updated"}); err != nil {
			t.Errorf("Update() error = %v, want nil for zero matching rows", err)
		}
	})

	t.Run("database error", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		if err := db.Migrator().DropTable(&models.SavedApplication{}); err != nil {
			t.Fatalf("drop application table: %v", err)
		}
		if err := repo.Update("application-1", map[string]any{"name": "Updated"}); err == nil {
			t.Fatal("Update() error = nil, want an error for a missing table")
		}
	})
}

func TestApplicationRepository_Delete(t *testing.T) {
	t.Run("deletes existing application", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		application := models.SavedApplication{ID: "application-1", Application: models.Application{Name: "Engineer"}}
		if err := db.Create(&application).Error; err != nil {
			t.Fatalf("seed application: %v", err)
		}

		if err := repo.Delete(application.ID); err != nil {
			t.Fatalf("Delete() error = %v", err)
		}
		if _, err := repo.GetByID(application.ID); !errors.Is(err, gorm.ErrRecordNotFound) {
			t.Errorf("GetByID() after delete error = %v, want %v", err, gorm.ErrRecordNotFound)
		}
	})

	t.Run("unknown ID succeeds", func(t *testing.T) {
		repo, _ := newTestApplicationRepository(t)
		if err := repo.Delete("missing"); err != nil {
			t.Errorf("Delete() error = %v, want nil for zero matching rows", err)
		}
	})

	t.Run("database error", func(t *testing.T) {
		repo, db := newTestApplicationRepository(t)
		if err := db.Migrator().DropTable(&models.SavedApplication{}); err != nil {
			t.Fatalf("drop application table: %v", err)
		}
		if err := repo.Delete("application-1"); err == nil {
			t.Fatal("Delete() error = nil, want an error for a missing table")
		}
	})
}
