package models

import (
    "database/sql"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
    var err error
    DB, err = sql.Open("sqlite3", "./sfas.db")
    if err != nil {
        log.Fatal(err)
    }

    createTables()
}

func createTables() {
    investmentTable := `
    CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        principal REAL NOT NULL,
        annual_rate REAL NOT NULL,
        monthly_addition_enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`

    settingsTable := `
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        monthly_addition REAL DEFAULT 0
    );`

    if _, err := DB.Exec(investmentTable); err != nil {
        log.Fatal(err)
    }

    if _, err := DB.Exec(settingsTable); err != nil {
        log.Fatal(err)
    }

    // 初始化设置
    DB.Exec("INSERT OR IGNORE INTO settings (id, monthly_addition) VALUES (1, 0)")
    
    // 为现有的投资项目添加默认的 monthly_addition_enabled 字段
    DB.Exec("ALTER TABLE investments ADD COLUMN monthly_addition_enabled BOOLEAN DEFAULT 1")
}
