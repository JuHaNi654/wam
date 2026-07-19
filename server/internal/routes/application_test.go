package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"server/internal/models"
	"server/internal/repositories"
	"server/internal/services"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupServiceEnvironment(t *testing.T) *services.Service {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
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

func newApplicationTestContext(method string, target string, body []byte) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = httptest.NewRequest(method, target, bytes.NewBuffer(body))
	ctx.Request.Header.Set("Content-Type", "application/json")
	return ctx, w
}

func resopnseDecoder(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	return payload
}

func shouldContainHelper(t testing.TB, data map[string]any, expected []string) {
	t.Helper()
	for _, key := range expected {
		_, isOk := data[key]
		if !isOk {
			t.Errorf("%s property is missing", key)
		}
	}
}

func shouldNotContainHelper(t testing.TB, data map[string]any, expected []string) {
	t.Helper()
	for _, key := range expected {
		_, isOk := data[key]
		if isOk {
			t.Errorf("%s should not set", key)
		}
	}
}

func TestApplicationRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	services := setupServiceEnvironment(t)

	// Load test data
	application := &models.Application{Name: "Backend Role", Company: "Acme", Status: "saved"}
	if err := services.ApplicationRepository.Create(application); err != nil {
		t.Fatalf("failed to seed application: %v", err)
	}

	t.Run("(GET /api/applications) should return 200", func(t *testing.T) {
		shouldIncludeKeys := []string{"id", "name", "company", "status", "create_date"}
		shouldExcludeKeys := []string{"ad", "application", "homepage"}

		ctx, recorder := newApplicationTestContext(http.MethodGet, "/api/applications", []byte{})
		errResp := listApplications(ctx, services)
		if errResp != nil {
			t.Fatalf("expected nil error response, got %+v", errResp)
		}

		if recorder.Code != http.StatusOK {
			t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
		}

		payload := resopnseDecoder(t, recorder)
		data := payload["data"].(map[string]any)
		applications := data["applications"].([]any)
		if len(applications) != 1 {
			t.Fatalf("expected 1 application, got %d", len(applications))
		}

		applicationData := applications[0].(map[string]any)
		shouldContainHelper(t, applicationData, shouldIncludeKeys)
		shouldNotContainHelper(t, applicationData, shouldExcludeKeys)
	})

	t.Run("(POST /api/applications) should return 201", func(t *testing.T) {
		data := map[string]any{
			"name":     "Example application name",
			"company":  "Examply company",
			"position": "Developer",
			"status":   "saved",
		}

		b, _ := json.Marshal(data)
		ctx, recorder := newApplicationTestContext(http.MethodPost, "/api/applications", b)
		errResp := createApplication(ctx, services)

		if errResp != nil {
			t.Fatalf("expected nil error response, got %+v", errResp)
		}

		if recorder.Code != http.StatusCreated {
			t.Fatalf("expected status %d, got %d", http.StatusCreated, recorder.Code)
		}
	})

	t.Run("(POST /api/applications) should return 400", func(t *testing.T) {
		data := map[string]any{
			"name":     "",
			"company":  "",
			"position": "",
			"status":   "",
		}

		b, _ := json.Marshal(data)

		ctx, recorder := newApplicationTestContext(http.MethodPost, "/api/applications", b)
		errResp := createApplication(ctx, services)
		if errResp == nil {
			t.Fatalf("expected error response, got %+v", errResp)
		}

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
		}
	})
}
