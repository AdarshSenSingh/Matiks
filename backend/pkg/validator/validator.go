package validator

import (
	"errors"
	"regexp"
	"strings"
)

// ValidateEmail validates an email address
func ValidateEmail(email string) error {
	if email == "" {
		return errors.New("email is required")
	}

	// Simple email validation
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email format")
	}

	return nil
}

// ValidateUsername validates a username
func ValidateUsername(username string) error {
	if username == "" {
		return errors.New("username is required")
	}

	if len(username) < 3 || len(username) > 20 {
		return errors.New("username must be between 3 and 20 characters")
	}

	// Username can only contain alphanumeric characters and underscores
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	if !usernameRegex.MatchString(username) {
		return errors.New("username can only contain letters, numbers, and underscores")
	}

	return nil
}

// ValidatePassword validates a password
func ValidatePassword(password string) error {
	if password == "" {
		return errors.New("password is required")
	}

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	// Password must contain at least one uppercase letter, one lowercase letter, and one number
	hasUpper := false
	hasLower := false
	hasNumber := false

	for _, char := range password {
		if 'A' <= char && char <= 'Z' {
			hasUpper = true
		} else if 'a' <= char && char <= 'z' {
			hasLower = true
		} else if '0' <= char && char <= '9' {
			hasNumber = true
		}
	}

	if !hasUpper {
		return errors.New("password must contain at least one uppercase letter")
	}

	if !hasLower {
		return errors.New("password must contain at least one lowercase letter")
	}

	if !hasNumber {
		return errors.New("password must contain at least one number")
	}

	return nil
}

// ValidateHectocSolution validates a Hectoc solution
func ValidateHectocSolution(puzzle, solution string) error {
	if puzzle == "" {
		return errors.New("puzzle is required")
	}

	if solution == "" {
		return errors.New("solution is required")
	}

	// Remove all whitespace from solution
	solution = strings.ReplaceAll(solution, " ", "")

	// Check if all digits from the puzzle are used in the solution
	for _, digit := range puzzle {
		if !strings.Contains(solution, string(digit)) {
			return errors.New("solution must use all digits from the puzzle")
		}
	}

	// TODO: Implement more complex validation
	// 1. Check if digits are in the correct order
	// 2. Check if the expression is valid
	// 3. Check if the result equals 100

	return nil
}
