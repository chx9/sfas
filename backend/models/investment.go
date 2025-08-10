package models

import (
    "time"
)

type Investment struct {
    ID                     int       `json:"id"`
    Name                   string    `json:"name"`
    Principal              float64   `json:"principal"`
    AnnualRate             float64   `json:"annual_rate"`
    MonthlyAdditionEnabled bool      `json:"monthly_addition_enabled"`
    CreatedAt              time.Time `json:"created_at"`
}

type Settings struct {
    ID             int     `json:"id"`
    MonthlyAddition float64 `json:"monthly_addition"`
}

func GetAllInvestments() ([]Investment, error) {
    rows, err := DB.Query("SELECT id, name, principal, annual_rate, COALESCE(monthly_addition_enabled, 1), created_at FROM investments")
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var investments []Investment
    for rows.Next() {
        var inv Investment
        err := rows.Scan(&inv.ID, &inv.Name, &inv.Principal, &inv.AnnualRate, &inv.MonthlyAdditionEnabled, &inv.CreatedAt)
        if err != nil {
            return nil, err
        }
        investments = append(investments, inv)
    }
    return investments, nil
}

func CreateInvestment(inv Investment) error {
    _, err := DB.Exec("INSERT INTO investments (name, principal, annual_rate, monthly_addition_enabled) VALUES (?, ?, ?, ?)",
        inv.Name, inv.Principal, inv.AnnualRate, inv.MonthlyAdditionEnabled)
    return err
}

func UpdateInvestment(inv Investment) error {
    _, err := DB.Exec("UPDATE investments SET name=?, principal=?, annual_rate=?, monthly_addition_enabled=? WHERE id=?",
        inv.Name, inv.Principal, inv.AnnualRate, inv.MonthlyAdditionEnabled, inv.ID)
    return err
}

func DeleteInvestment(id int) error {
    _, err := DB.Exec("DELETE FROM investments WHERE id=?", id)
    return err
}

func GetSettings() (Settings, error) {
    var settings Settings
    err := DB.QueryRow("SELECT id, monthly_addition FROM settings WHERE id=1").Scan(
        &settings.ID, &settings.MonthlyAddition)
    return settings, err
}

func UpdateSettings(settings Settings) error {
    _, err := DB.Exec("UPDATE settings SET monthly_addition=? WHERE id=1", settings.MonthlyAddition)
    return err
}
