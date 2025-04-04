package services

import (
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"github.com/hectoclash/internal/config"
	"github.com/hectoclash/internal/models"
	"github.com/hectoclash/internal/repository"
)

// AuthService handles authentication operations
type AuthService struct {
	userRepo *repository.UserRepository
	config   *config.Config
}

// NewAuthService creates a new authentication service
func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		config:   cfg,
	}
}

// RegisterInput represents the input for user registration
type RegisterInput struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginInput represents the input for user login
type LoginInput struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required"`
	RememberMe bool   `json:"rememberMe"`
}

// TokenPair represents an access and refresh token pair
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

// Claims represents the JWT claims
type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

// Register registers a new user
func (s *AuthService) Register(input RegisterInput) (*models.User, error) {
	// Check if email already exists
	existingUser, err := s.userRepo.FindByEmail(input.Email)
	if err == nil && existingUser != nil {
		return nil, errors.New("email already in use")
	}

	// Check if username already exists
	existingUser, err = s.userRepo.FindByUsername(input.Username)
	if err == nil && existingUser != nil {
		return nil, errors.New("username already taken")
	}

	// Create new user
	user := &models.User{
		ID:       uuid.New().String(),
		Username: input.Username,
		Email:    input.Email,
		Password: input.Password,
		Rating:   1000,
	}

	// Save user to database
	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// Login authenticates a user and returns a token pair
func (s *AuthService) Login(input LoginInput) (*models.User, *TokenPair, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(input.Email)
	if err != nil {
		return nil, nil, errors.New("invalid email or password")
	}

	// Check password
	err = user.ComparePassword(input.Password)
	if err != nil {
		return nil, nil, errors.New("invalid email or password")
	}

	// Update last login time
	user.LastLogin = time.Now()
	err = s.userRepo.Update(user)
	if err != nil {
		return nil, nil, errors.New("failed to update user")
	}

	// Generate tokens with appropriate expiry based on rememberMe
	tokenPair, err := s.GenerateTokenPairWithOptions(user.ID, input.RememberMe)
	if err != nil {
		return nil, nil, err
	}

	return user, tokenPair, nil
}

// GenerateTokenPair generates a new access and refresh token pair
func (s *AuthService) GenerateTokenPair(userID string) (*TokenPair, error) {
	return s.GenerateTokenPairWithOptions(userID, false)
}

// GenerateTokenPairWithOptions generates a new access and refresh token pair with options
func (s *AuthService) GenerateTokenPairWithOptions(userID string, rememberMe bool) (*TokenPair, error) {
	// Determine token expiry times based on rememberMe
	var accessTokenExpiry time.Duration
	var refreshTokenExpiry time.Duration

	if rememberMe {
		// Longer expiry for "remember me" option
		accessTokenExpiry = s.config.JWT.ExpiresIn * 7        // 7 times longer
		refreshTokenExpiry = s.config.JWT.RefreshExpiry * 30  // 30 times longer
	} else {
		accessTokenExpiry = s.config.JWT.ExpiresIn
		refreshTokenExpiry = s.config.JWT.RefreshExpiry
	}

	// Create access token
	accessTokenExpiryTime := time.Now().Add(accessTokenExpiry)
	accessTokenClaims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: accessTokenExpiryTime.Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessTokenClaims)
	accessTokenString, err := accessToken.SignedString([]byte(s.config.JWT.Secret))
	if err != nil {
		return nil, err
	}

	// Create refresh token
	refreshTokenExpiryTime := time.Now().Add(refreshTokenExpiry)
	refreshTokenClaims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: refreshTokenExpiryTime.Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.config.JWT.RefreshSecret))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresIn:    accessTokenExpiryTime.Unix(),
	}, nil
}

// ValidateToken validates a JWT token
func (s *AuthService) ValidateToken(tokenString string, isRefreshToken bool) (*Claims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}

		// Return the appropriate secret
		if isRefreshToken {
			return []byte(s.config.JWT.RefreshSecret), nil
		}
		return []byte(s.config.JWT.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	// Extract claims
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshToken refreshes an access token using a refresh token
func (s *AuthService) RefreshToken(refreshToken string) (*TokenPair, error) {
	// Validate refresh token
	claims, err := s.ValidateToken(refreshToken, true)
	if err != nil {
		return nil, err
	}

	// Check if user exists
	user, err := s.userRepo.FindByID(claims.UserID)
	if err != nil {
		return nil, err
	}

	// Update last activity time
	user.LastActivity = time.Now()
	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	// Generate new token pair
	// Determine if this was a "remember me" token by checking its expiry
	isRememberMe := claims.ExpiresAt - claims.IssuedAt > int64(s.config.JWT.RefreshExpiry.Seconds()*2)
	return s.GenerateTokenPairWithOptions(claims.UserID, isRememberMe)
}

// GetUserByID gets a user by ID
func (s *AuthService) GetUserByID(userID string) (*models.User, error) {
	return s.userRepo.FindByID(userID)
}

// UpdateUserLastActivity updates the user's last activity timestamp
func (s *AuthService) UpdateUserLastActivity(userID string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	user.LastActivity = time.Now()
	return s.userRepo.Update(user)
}

// GetUserStreak gets the user's current streak
func (s *AuthService) GetUserStreak(userID string) (int, error) {
	stats, err := s.userRepo.GetUserStats(userID)
	if err != nil {
		return 0, err
	}
	return stats.CurrentStreak, nil
}