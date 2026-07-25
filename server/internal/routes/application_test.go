package routes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"server/internal/logger"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/services"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// TestMain initialises package-level state shared across all test cases.
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	logger.InitLoger(logger.NoLog{})
	os.Exit(m.Run())
}

func setupServiceEnvironment(t *testing.T) *services.Service {
	t.Helper()
	dsn := fmt.Sprintf("file:testdb_%d?mode=memory&cache=private", time.Now().UnixNano())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}

	err = db.AutoMigrate(
		&models.Application{},
		&models.Skill{},
		&models.ApplicationSkill{},
		&models.Action{},
	)
	if err != nil {
		t.Fatalf("failed to migrate test db: %v", err)
	}

	initalizeValidator()
	return &services.Service{
		ApplicationRepository: repositories.NewApplicationRepository(db),
		ActionRepository:      repositories.NewActionRepository(db),
		SkillRepository:       repositories.NewSkillRepository(db),
	}
}

func newApplicationTestContext(method, target string, body []byte) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = httptest.NewRequest(method, target, bytes.NewBuffer(body))
	ctx.Request.Header.Set("Content-Type", "application/json")
	return ctx, w
}

func responseDecoder(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	return payload
}

// --- listApplications ---

func TestListApplications(t *testing.T) {
	tests := []struct {
		name    string
		seed    []models.Application
		wantLen int
	}{
		{
			name:    "empty database returns empty list",
			seed:    nil,
			wantLen: 0,
		},
		{
			name: "single application is returned",
			seed: []models.Application{
				{Name: "Backend Role", Company: "Acme", Position: "Engineer", Status: models.Saved},
			},
			wantLen: 1,
		},
		{
			name: "multiple applications are all returned",
			seed: []models.Application{
				{Name: "Role A", Company: "Corp A", Position: "Dev", Status: models.Saved},
				{Name: "Role B", Company: "Corp B", Position: "Dev", Status: models.Applied},
			},
			wantLen: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := setupServiceEnvironment(t)
			for i := range tt.seed {
				if err := svc.ApplicationRepository.Create(&tt.seed[i]); err != nil {
					t.Fatalf("seed: %v", err)
				}
			}

			ctx, recorder := newApplicationTestContext(http.MethodGet, "/api/applications", nil)
			errResp := listApplications(ctx, svc)

			if errResp != nil {
				t.Fatalf("listApplications() unexpected error: %+v", errResp)
			}
			if recorder.Code != http.StatusOK {
				t.Errorf("listApplications() status = %d, want %d", recorder.Code, http.StatusOK)
			}

			payload := responseDecoder(t, recorder)
			items, ok := payload["data"].([]any)
			if !ok {
				// omitempty may omit an absent/empty slice; treat as length 0.
				if tt.wantLen == 0 {
					return
				}
				t.Fatalf("listApplications() data is not a list, got %T", payload["data"])
			}
			if len(items) != tt.wantLen {
				t.Errorf("listApplications() len(data) = %d, want %d", len(items), tt.wantLen)
			}
		})
	}
}

// TestListApplications_ResponseShape verifies which keys are included and excluded
// from each item in the list response.
func TestListApplications_ResponseShape(t *testing.T) {
	svc := setupServiceEnvironment(t)
	app := &models.Application{Name: "Shape Test", Company: "Acme", Position: "Dev", Status: models.Saved}
	if err := svc.ApplicationRepository.Create(app); err != nil {
		t.Fatalf("seed: %v", err)
	}

	ctx, recorder := newApplicationTestContext(http.MethodGet, "/api/applications", nil)
	if errResp := listApplications(ctx, svc); errResp != nil {
		t.Fatalf("listApplications() unexpected error: %+v", errResp)
	}

	payload := responseDecoder(t, recorder)
	items, ok := payload["data"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("listApplications() expected non-empty list in data")
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("listApplications() item is not an object, got %T", items[0])
	}

	for _, key := range []string{"id", "name", "company", "status", "create_date"} {
		if _, present := item[key]; !present {
			t.Errorf("listApplications() response item missing key %q", key)
		}
	}
	for _, key := range []string{"ad", "application", "homepage"} {
		if _, present := item[key]; present {
			t.Errorf("listApplications() response item should not contain key %q", key)
		}
	}
}

// --- createApplication ---

func TestCreateApplication(t *testing.T) {
	tests := []struct {
		name     string
		body     map[string]any
		wantCode int
		wantErr  bool
	}{
		{
			name: "valid application is created",
			body: map[string]any{
				"name":     "Backend Engineer",
				"company":  "Acme Corp",
				"position": "Engineer",
				"status":   "saved",
			},
			wantCode: http.StatusCreated,
			wantErr:  false,
		},
		{
			name: "all required fields empty returns 400",
			body: map[string]any{
				"name":     "",
				"company":  "",
				"position": "",
				"status":   "",
			},
			wantCode: http.StatusBadRequest,
			wantErr:  true,
		},
		{
			name: "missing name returns 400",
			body: map[string]any{
				"company":  "Acme Corp",
				"position": "Engineer",
				"status":   "saved",
			},
			wantCode: http.StatusBadRequest,
			wantErr:  true,
		},
		{
			name: "invalid status value returns 400",
			body: map[string]any{
				"name":     "Dev Role",
				"company":  "Acme",
				"position": "Dev",
				"status":   "unknown_status",
			},
			wantCode: http.StatusBadRequest,
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := setupServiceEnvironment(t)

			b, err := json.Marshal(tt.body)
			if err != nil {
				t.Fatalf("marshal body: %v", err)
			}

			ctx, recorder := newApplicationTestContext(http.MethodPost, "/api/applications", b)
			errResp := createApplication(ctx, svc)

			if tt.wantErr {
				if errResp == nil {
					t.Fatalf("createApplication() expected error response, got nil")
				}
				if errResp.StatusCode != tt.wantCode {
					t.Errorf("createApplication() error status = %d, want %d", errResp.StatusCode, tt.wantCode)
				}
				return
			}

			if errResp != nil {
				t.Fatalf("createApplication() unexpected error: %+v", errResp)
			}
			if recorder.Code != tt.wantCode {
				t.Errorf("createApplication() status = %d, want %d", recorder.Code, tt.wantCode)
			}
		})
	}
}

// --- getApplicationByID ---

func TestGetApplicationByID(t *testing.T) {
	tests := []struct {
		name     string
		seedApp  bool
		paramID  func(seeded *models.Application) string
		wantCode int
		wantErr  bool
	}{
		{
			name:     "existing application returns 200 with full payload",
			seedApp:  true,
			paramID:  func(a *models.Application) string { return a.ID },
			wantCode: http.StatusOK,
			wantErr:  false,
		},
		{
			name:     "non-existent ID returns 404",
			seedApp:  false,
			paramID:  func(_ *models.Application) string { return "00000000-0000-0000-0000-000000000000" },
			wantCode: http.StatusNotFound,
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := setupServiceEnvironment(t)
			app := &models.Application{Name: "Test App", Company: "Corp", Position: "Dev", Status: models.Saved}
			if tt.seedApp {
				if err := svc.ApplicationRepository.Create(app); err != nil {
					t.Fatalf("seed: %v", err)
				}
			}

			id := tt.paramID(app)
			ctx, recorder := newApplicationTestContext(http.MethodGet, "/api/applications/"+id, nil)
			ctx.Params = gin.Params{{Key: "id", Value: id}}

			errResp := getApplicationByID(ctx, svc)

			if tt.wantErr {
				if errResp == nil {
					t.Fatalf("getApplicationByID() expected error response, got nil")
				}
				if errResp.StatusCode != tt.wantCode {
					t.Errorf("getApplicationByID() error status = %d, want %d", errResp.StatusCode, tt.wantCode)
				}
				return
			}

			if errResp != nil {
				t.Fatalf("getApplicationByID() unexpected error: %+v", errResp)
			}
			if recorder.Code != tt.wantCode {
				t.Errorf("getApplicationByID() status = %d, want %d", recorder.Code, tt.wantCode)
			}

			payload := responseDecoder(t, recorder)
			data, ok := payload["data"].(map[string]any)
			if !ok {
				t.Fatalf("getApplicationByID() data is not an object, got %T", payload["data"])
			}
			for _, key := range []string{"application", "actions", "skills"} {
				if _, present := data[key]; !present {
					t.Errorf("getApplicationByID() response missing key %q", key)
				}
			}
		})
	}
}

// --- updateApplication ---

func TestUpdateApplication(t *testing.T) {
	tests := []struct {
		name     string
		body     map[string]any
		wantCode int
		wantErr  bool
	}{
		{
			name:     "valid field update returns 204",
			body:     map[string]any{"status": "applied"},
			wantCode: http.StatusNoContent,
			wantErr:  false,
		},
		{
			name:     "empty body returns 204",
			body:     map[string]any{},
			wantCode: http.StatusNoContent,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := setupServiceEnvironment(t)
			app := &models.Application{Name: "Update Me", Company: "Corp", Position: "Dev", Status: models.Saved}
			if err := svc.ApplicationRepository.Create(app); err != nil {
				t.Fatalf("seed: %v", err)
			}

			b, err := json.Marshal(tt.body)
			if err != nil {
				t.Fatalf("marshal body: %v", err)
			}

			ctx, recorder := newApplicationTestContext(http.MethodPut, "/api/applications/"+app.ID, b)
			ctx.Params = gin.Params{{Key: "id", Value: app.ID}}

			errResp := updateApplication(ctx, svc)

			if tt.wantErr {
				if errResp == nil {
					t.Fatalf("updateApplication() expected error response, got nil")
				}
				if errResp.StatusCode != tt.wantCode {
					t.Errorf("updateApplication() error status = %d, want %d", errResp.StatusCode, tt.wantCode)
				}
				return
			}

			if errResp != nil {
				t.Fatalf("updateApplication() unexpected error: %+v", errResp)
			}
			if recorder.Code != tt.wantCode {
				t.Errorf("updateApplication() status = %d, want %d", recorder.Code, tt.wantCode)
			}
		})
	}
}

// --- deleteApplication ---

func TestDeleteApplication(t *testing.T) {
	tests := []struct {
		name     string
		seedApp  bool
		wantCode int
		wantErr  bool
	}{
		{
			name:     "delete existing application returns 204",
			seedApp:  true,
			wantCode: http.StatusNoContent,
			wantErr:  false,
		},
		{
			name:     "delete non-existent ID returns 204",
			seedApp:  false,
			wantCode: http.StatusNoContent,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := setupServiceEnvironment(t)
			app := &models.Application{Name: "Delete Me", Company: "Corp", Position: "Dev", Status: models.Saved}

			id := "00000000-0000-0000-0000-000000000000"
			if tt.seedApp {
				if err := svc.ApplicationRepository.Create(app); err != nil {
					t.Fatalf("seed: %v", err)
				}
				id = app.ID
			}

			ctx, recorder := newApplicationTestContext(http.MethodDelete, "/api/applications/"+id, nil)
			ctx.Params = gin.Params{{Key: "id", Value: id}}

			errResp := deleteApplication(ctx, svc)

			if tt.wantErr {
				if errResp == nil {
					t.Fatalf("deleteApplication() expected error response, got nil")
				}
				if errResp.StatusCode != tt.wantCode {
					t.Errorf("deleteApplication() error status = %d, want %d", errResp.StatusCode, tt.wantCode)
				}
				return
			}

			if errResp != nil {
				t.Fatalf("deleteApplication() unexpected error: %+v", errResp)
			}
			if recorder.Code != tt.wantCode {
				t.Errorf("deleteApplication() status = %d, want %d", recorder.Code, tt.wantCode)
			}
		})
	}
}

// --- addSkillsToTheApplication ---

func TestAddSkillsToTheApplication(t *testing.T) {
	tests := []struct {
		name     string
		body     models.UpdateSkills
		wantCode int
		wantErr  bool
	}{
		{
			name: "add two skills returns 200",
			body: models.UpdateSkills{
				Skills: []models.Skill{
					{ID: "skill-1", Name: "Go"},
					{ID: "skill-2", Name: "SQL"},
				},
			},
			wantCode: http.StatusOK,
			wantErr:  false,
		},
		{
			name:     "empty skills list returns 200",
			body:     models.UpdateSkills{Skills: []models.Skill{}},
			wantCode: http.StatusOK,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := setupServiceEnvironment(t)
			app := &models.Application{Name: "Skill App", Company: "Corp", Position: "Dev", Status: models.Saved}
			if err := svc.ApplicationRepository.Create(app); err != nil {
				t.Fatalf("seed app: %v", err)
			}

			b, err := json.Marshal(tt.body)
			if err != nil {
				t.Fatalf("marshal body: %v", err)
			}

			ctx, recorder := newApplicationTestContext(http.MethodPost, "/api/applications/"+app.ID+"/skills", b)
			ctx.Params = gin.Params{{Key: "id", Value: app.ID}}

			errResp := addSkillsToTheApplication(ctx, svc)

			if tt.wantErr {
				if errResp == nil {
					t.Fatalf("addSkillsToTheApplication() expected error response, got nil")
				}
				if errResp.StatusCode != tt.wantCode {
					t.Errorf("addSkillsToTheApplication() error status = %d, want %d", errResp.StatusCode, tt.wantCode)
				}
				return
			}

			if errResp != nil {
				t.Fatalf("addSkillsToTheApplication() unexpected error: %+v", errResp)
			}
			if recorder.Code != tt.wantCode {
				t.Errorf("addSkillsToTheApplication() status = %d, want %d", recorder.Code, tt.wantCode)
			}
		})
	}
}
