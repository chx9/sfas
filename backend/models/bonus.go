package models

import (
    "math"
    "time"
)

type Bonus struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Amount    float64   `json:"amount"`
    Month     int       `json:"month"`
    CreatedAt time.Time `json:"created_at"`
}

// 修复浮点数精度 - 只在这里定义一次
func roundToTwoDecimal(num float64) float64 {
    return math.Round(num*100) / 100
}

func GetAllBonuses() ([]Bonus, error) {
    rows, err := DB.Query("SELECT id, name, amount, month, created_at FROM bonuses ORDER BY month ASC")
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var bonuses []Bonus
    for rows.Next() {
        var bonus Bonus
        err := rows.Scan(&bonus.ID, &bonus.Name, &bonus.Amount, &bonus.Month, &bonus.CreatedAt)
        if err != nil {
            return nil, err
        }
        bonuses = append(bonuses, bonus)
    }
    return bonuses, nil
}

func CreateBonus(bonus Bonus) error {
    _, err := DB.Exec("INSERT INTO bonuses (name, amount, month) VALUES (?, ?, ?)",
        bonus.Name, bonus.Amount, bonus.Month)
    return err
}

func UpdateBonus(bonus Bonus) error {
    _, err := DB.Exec("UPDATE bonuses SET name=?, amount=?, month=? WHERE id=?",
        bonus.Name, bonus.Amount, bonus.Month, bonus.ID)
    return err
}

func DeleteBonus(id int) error {
    _, err := DB.Exec("DELETE FROM bonuses WHERE id=?", id)
    return err
}
