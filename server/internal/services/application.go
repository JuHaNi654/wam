package services

import (
	"errors"
	"server/internal/models"
	"server/internal/scraper"
)

func ApplicationFetchAdText(m *models.Application, s *Service) error {
	if s == nil {
		return errors.New("service model is empty")
	}

	if m == nil {
		return errors.New("application model is empty")
	}

	if m.Link == nil {
		return nil
	}

	setting, err := s.SettingsRepository.Get()
	if err != nil {
		return err
	}

	m.Ad, err = scraper.Scrape(&scraper.Config{
		URL:              *m.Link,
		AvailableTargets: setting.Targets,
	})

	return err
}
