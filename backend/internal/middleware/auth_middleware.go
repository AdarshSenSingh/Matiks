package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hectoclash/internal/services"
)

// AuthMiddleware is a middleware for authentication
type AuthMiddleware struct {
	authService *services.AuthService
}

// NewAuthMiddleware creates a new authentication middleware
func NewAuthMiddleware(authService *services.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

// RequireAuth is a middleware that requires authentication
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from cookie
		tokenString, err := c.Cookie("access_token")
		if err != nil {
			// If no cookie, try to get token from Authorization header
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		// Check if token exists
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authentication required",
			})
			c.Abort()
			return
		}

		// Validate token
		claims, err := m.authService.ValidateToken(tokenString, false)
		if err != nil {
			// Try to refresh the token if a refresh token is available
			refreshToken, refreshErr := c.Cookie("refresh_token")
			if refreshErr == nil && refreshToken != "" {
				// Attempt to refresh the token
				tokenPair, refreshErr := m.authService.RefreshToken(refreshToken)
				if refreshErr == nil {
					// Set the new tokens in cookies
					isRememberMe := tokenPair.ExpiresIn > time.Now().Add(time.Hour*24*7).Unix()
					setAuthCookies(c, tokenPair, isRememberMe)

					// Get user ID from the new token
					newClaims, _ := m.authService.ValidateToken(tokenPair.AccessToken, false)
					if newClaims != nil {
						// Set user ID in context
						c.Set("userID", newClaims.UserID)
						c.Next()
						return
					}
				}
			}

			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user ID in context
		c.Set("userID", claims.UserID)

		// Update last activity time in background
		go func() {
			_ = m.authService.UpdateUserLastActivity(claims.UserID)
		}()

		c.Next()
	}
}

// OptionalAuth is a middleware that optionally authenticates the user
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from cookie
		tokenString, err := c.Cookie("access_token")
		if err != nil {
			// If no cookie, try to get token from Authorization header
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		// If token exists, validate it
		if tokenString != "" {
			claims, err := m.authService.ValidateToken(tokenString, false)
			if err == nil {
				// Set user ID in context
				c.Set("userID", claims.UserID)

				// Update last activity time in background
				go func() {
					_ = m.authService.UpdateUserLastActivity(claims.UserID)
				}()
			} else {
				// Try to refresh the token if a refresh token is available
				refreshToken, refreshErr := c.Cookie("refresh_token")
				if refreshErr == nil && refreshToken != "" {
					// Attempt to refresh the token
					tokenPair, refreshErr := m.authService.RefreshToken(refreshToken)
					if refreshErr == nil {
						// Set the new tokens in cookies
						isRememberMe := tokenPair.ExpiresIn > time.Now().Add(time.Hour*24*7).Unix()
						setAuthCookies(c, tokenPair, isRememberMe)

						// Get user ID from the new token
						newClaims, _ := m.authService.ValidateToken(tokenPair.AccessToken, false)
						if newClaims != nil {
							// Set user ID in context
							c.Set("userID", newClaims.UserID)
						}
					}
				}
			}
		}

		c.Next()
	}
}

// Helper function to set authentication cookies
func setAuthCookies(c *gin.Context, tokenPair *services.TokenPair, rememberMe bool) {
	// Calculate expiry times
	accessTokenMaxAge := 3600 // 1 hour default
	refreshTokenMaxAge := 604800 // 7 days default

	if rememberMe {
		accessTokenMaxAge *= 7   // 7 times longer
		refreshTokenMaxAge *= 4  // 4 times longer (28 days)
	}

	// Set access token cookie
	c.SetCookie(
		"access_token",
		tokenPair.AccessToken,
		accessTokenMaxAge,
		"/",
		"",
		c.Request.TLS != nil, // Secure if HTTPS
		true, // HttpOnly
	)

	// Set refresh token cookie
	c.SetCookie(
		"refresh_token",
		tokenPair.RefreshToken,
		refreshTokenMaxAge,
		"/",
		"",
		c.Request.TLS != nil, // Secure if HTTPS
		true, // HttpOnly
	)

	// Set a non-HttpOnly cookie to indicate login status to JavaScript
	c.SetCookie(
		"logged_in",
		"true",
		refreshTokenMaxAge,
		"/",
		"",
		c.Request.TLS != nil, // Secure if HTTPS
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
			c.Request.TLS != nil, // Secure if HTTPS
			false, // Not HttpOnly so JavaScript can read it
		)
	}
}
