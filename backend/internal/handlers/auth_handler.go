package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/config"
	"github.com/hectoclash/internal/services"
)

// AuthHandler handles authentication requests
type AuthHandler struct {
	authService *services.AuthService
	config      *config.Config
}

// NewAuthHandler creates a new authentication handler
func NewAuthHandler(authService *services.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		config:      cfg,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var input services.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	// Register user
	user, err := h.authService.Register(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Generate tokens
	tokenPair, err := h.authService.GenerateTokenPair(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate tokens",
		})
		return
	}

	// Set cookies
	h.setAuthCookies(c, tokenPair, false)

	// Return user data
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    user.ToResponse(),
	})
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var input services.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	// Login user
	user, tokenPair, err := h.authService.Login(input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Set cookies with remember me option
	h.setAuthCookies(c, tokenPair, input.RememberMe)

	// Return user data
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user.ToResponse(),
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear cookies
	h.clearAuthCookies(c)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// Get refresh token from cookie
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		// Try to get from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			refreshToken = authHeader[7:]
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Refresh token not found",
			})
			return
		}
	}

	// Refresh token
	tokenPair, err := h.authService.RefreshToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid refresh token",
		})
		return
	}

	// Determine if this was a "remember me" token by checking its expiry
	isRememberMe := tokenPair.ExpiresIn > time.Now().Add(h.config.JWT.ExpiresIn*2).Unix()

	// Set cookies
	h.setAuthCookies(c, tokenPair, isRememberMe)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Token refreshed successfully",
	})
}

// GetCurrentUser gets the current user
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Not authenticated",
		})
		return
	}

	// Update last activity
	err := h.authService.UpdateUserLastActivity(userID.(string))
	if err != nil {
		// Log the error but don't fail the request
		// This is not critical for the user experience
		// TODO: Add proper logging
	}

	// Get user
	user, err := h.authService.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	// Get user streak
	streak, err := h.authService.GetUserStreak(userID.(string))
	if err == nil && streak > 0 {
		user.Streak = streak
	}

	// Return user data
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user.ToResponse(),
	})
}

// Helper function to set authentication cookies
func (h *AuthHandler) setAuthCookies(c *gin.Context, tokenPair *services.TokenPair, rememberMe bool) {
	// Determine cookie max age
	accessTokenMaxAge := int(h.config.JWT.ExpiresIn.Seconds())
	refreshTokenMaxAge := int(h.config.JWT.RefreshExpiry.Seconds())

	if rememberMe {
		// Longer expiry for "remember me" option
		accessTokenMaxAge *= 7   // 7 times longer
		refreshTokenMaxAge *= 30 // 30 times longer
	}

	// Set access token cookie
	c.SetCookie(
		"access_token",
		tokenPair.AccessToken,
		accessTokenMaxAge,
		"/",
		"",
		h.config.Server.Env == "production",
		true, // HttpOnly
	)

	// Set refresh token cookie
	c.SetCookie(
		"refresh_token",
		tokenPair.RefreshToken,
		refreshTokenMaxAge,
		"/",
		"",
		h.config.Server.Env == "production",
		true, // HttpOnly
	)

	// Set a non-HttpOnly cookie to indicate login status to JavaScript
	c.SetCookie(
		"logged_in",
		"true",
		refreshTokenMaxAge,
		"/",
		"",
		h.config.Server.Env == "production",
		false, // Not HttpOnly so JavaScript can read it
	)

	// Set a non-HttpOnly cookie to indicate remember me status
	if rememberMe {
		c.SetCookie(
			"remember_me",
			"true",
			refreshTokenMaxAge,
			"/",
			"",
			h.config.Server.Env == "production",
			false, // Not HttpOnly so JavaScript can read it
		)
	}
}

// Helper function to clear authentication cookies
func (h *AuthHandler) clearAuthCookies(c *gin.Context) {
	// Clear access token cookie
	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		"",
		h.config.Server.Env == "production",
		true,
	)

	// Clear refresh token cookie
	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/",
		"",
		h.config.Server.Env == "production",
		true,
	)

	// Clear logged_in cookie
	c.SetCookie(
		"logged_in",
		"",
		-1,
		"/",
		"",
		h.config.Server.Env == "production",
		false,
	)

	// Clear remember_me cookie
	c.SetCookie(
		"remember_me",
		"",
		-1,
		"/",
		"",
		h.config.Server.Env == "production",
		false,
	)
}
