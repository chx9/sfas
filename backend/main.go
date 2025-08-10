package main

import (
    "sfas/models"
    "sfas/handlers"
    
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    models.InitDB()
    defer models.DB.Close()

    e := echo.New()
    
    e.Use(middleware.CORS())
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())

    api := e.Group("/api")
    
    api.GET("/investments", handlers.GetInvestments)
    api.POST("/investments", handlers.CreateInvestment)
    api.PUT("/investments/:id", handlers.UpdateInvestment)
    api.DELETE("/investments/:id", handlers.DeleteInvestment)
    
    api.GET("/settings", handlers.GetSettings)
    api.PUT("/settings", handlers.UpdateSettings)

    e.Logger.Fatal(e.Start(":8086"))
}
