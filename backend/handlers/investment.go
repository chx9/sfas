package handlers

import (
    "net/http"
    "strconv"
    "sfas/models"
    
    "github.com/labstack/echo/v4"
)

func GetInvestments(c echo.Context) error {
    investments, err := models.GetAllInvestments()
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, investments)
}

func CreateInvestment(c echo.Context) error {
    var inv models.Investment
    if err := c.Bind(&inv); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    
    if err := models.CreateInvestment(inv); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(http.StatusCreated, map[string]string{"message": "Investment created successfully"})
}

func UpdateInvestment(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
    }
    
    var inv models.Investment
    if err := c.Bind(&inv); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    
    inv.ID = id
    if err := models.UpdateInvestment(inv); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(http.StatusOK, map[string]string{"message": "Investment updated successfully"})
}

func DeleteInvestment(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
    }
    
    if err := models.DeleteInvestment(id); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(http.StatusOK, map[string]string{"message": "Investment deleted successfully"})
}

func GetSettings(c echo.Context) error {
    settings, err := models.GetSettings()
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, settings)
}

func UpdateSettings(c echo.Context) error {
    var settings models.Settings
    if err := c.Bind(&settings); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    
    settings.ID = 1
    if err := models.UpdateSettings(settings); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(http.StatusOK, map[string]string{"message": "Settings updated successfully"})
}
