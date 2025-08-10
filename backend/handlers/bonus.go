package handlers

import (
    "net/http"
    "strconv"
    "sfas/models"
    
    "github.com/labstack/echo/v4"
)

func GetBonuses(c echo.Context) error {
    bonuses, err := models.GetAllBonuses()
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, bonuses)
}

func CreateBonus(c echo.Context) error {
    var bonus models.Bonus
    if err := c.Bind(&bonus); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    
    if err := models.CreateBonus(bonus); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(http.StatusCreated, map[string]string{"message": "Bonus created successfully"})
}

func UpdateBonus(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
    }
    
    var bonus models.Bonus
    if err := c.Bind(&bonus); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    
    bonus.ID = id
    if err := models.UpdateBonus(bonus); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(http.StatusOK, map[string]string{"message": "Bonus updated successfully"})
}

func DeleteBonus(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
    }
    
    if err := models.DeleteBonus(id); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    return c.JSON(http.StatusOK, map[string]string{"message": "Bonus deleted successfully"})
}
