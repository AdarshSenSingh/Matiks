package puzzle

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"unicode"
)

// ExpressionEvaluator evaluates mathematical expressions
type ExpressionEvaluator struct{}

// NewExpressionEvaluator creates a new expression evaluator
func NewExpressionEvaluator() *ExpressionEvaluator {
	return &ExpressionEvaluator{}
}

// Evaluate evaluates a mathematical expression and returns the result
func (e *ExpressionEvaluator) Evaluate(expression string) (float64, error) {
	// Remove all whitespace
	expression = strings.ReplaceAll(expression, " ", "")

	// Tokenize the expression
	tokens, err := e.tokenize(expression)
	if err != nil {
		return 0, err
	}

	// Convert to postfix notation (Reverse Polish Notation)
	postfix, err := e.infixToPostfix(tokens)
	if err != nil {
		return 0, err
	}

	// Evaluate the postfix expression
	return e.evaluatePostfix(postfix)
}

// Token represents a token in a mathematical expression
type Token struct {
	Type  string
	Value string
}

// Tokenize converts an expression string into tokens
func (e *ExpressionEvaluator) tokenize(expression string) ([]Token, error) {
	tokens := []Token{}
	i := 0

	for i < len(expression) {
		char := expression[i]

		// Skip whitespace
		if unicode.IsSpace(rune(char)) {
			i++
			continue
		}

		// Handle numbers
		if unicode.IsDigit(rune(char)) {
			start := i
			for i < len(expression) && unicode.IsDigit(rune(expression[i])) {
				i++
			}
			tokens = append(tokens, Token{Type: "number", Value: expression[start:i]})
			continue
		}

		// Handle operators and parentheses
		switch char {
		case '+', '-', '*', '/', '^', '(', ')':
			tokens = append(tokens, Token{Type: string(char), Value: string(char)})
		default:
			return nil, fmt.Errorf("invalid character: %c", char)
		}
		i++
	}

	return tokens, nil
}

// InfixToPostfix converts an infix expression to postfix notation
func (e *ExpressionEvaluator) infixToPostfix(tokens []Token) ([]Token, error) {
	postfix := []Token{}
	stack := []Token{}

	precedence := map[string]int{
		"+": 1,
		"-": 1,
		"*": 2,
		"/": 2,
		"^": 3,
	}

	for _, token := range tokens {
		switch token.Type {
		case "number":
			postfix = append(postfix, token)
		case "(":
			stack = append(stack, token)
		case ")":
			for len(stack) > 0 && stack[len(stack)-1].Type != "(" {
				postfix = append(postfix, stack[len(stack)-1])
				stack = stack[:len(stack)-1]
			}
			if len(stack) == 0 {
				return nil, errors.New("mismatched parentheses")
			}
			// Pop the "("
			stack = stack[:len(stack)-1]
		default: // Operators
			for len(stack) > 0 && stack[len(stack)-1].Type != "(" &&
				precedence[stack[len(stack)-1].Type] >= precedence[token.Type] {
				postfix = append(postfix, stack[len(stack)-1])
				stack = stack[:len(stack)-1]
			}
			stack = append(stack, token)
		}
	}

	// Pop remaining operators from the stack
	for len(stack) > 0 {
		if stack[len(stack)-1].Type == "(" {
			return nil, errors.New("mismatched parentheses")
		}
		postfix = append(postfix, stack[len(stack)-1])
		stack = stack[:len(stack)-1]
	}

	return postfix, nil
}

// EvaluatePostfix evaluates a postfix expression
func (e *ExpressionEvaluator) evaluatePostfix(tokens []Token) (float64, error) {
	stack := []float64{}

	for _, token := range tokens {
		switch token.Type {
		case "number":
			num, err := strconv.ParseFloat(token.Value, 64)
			if err != nil {
				return 0, err
			}
			stack = append(stack, num)
		default: // Operators
			if len(stack) < 2 {
				return 0, errors.New("invalid expression")
			}
			b := stack[len(stack)-1]
			a := stack[len(stack)-2]
			stack = stack[:len(stack)-2]

			var result float64
			switch token.Type {
			case "+":
				result = a + b
			case "-":
				result = a - b
			case "*":
				result = a * b
			case "/":
				if b == 0 {
					return 0, errors.New("division by zero")
				}
				result = a / b
			case "^":
				result = 1
				for i := 0; i < int(b); i++ {
					result *= a
				}
			}
			stack = append(stack, result)
		}
	}

	if len(stack) != 1 {
		return 0, errors.New("invalid expression")
	}

	return stack[0], nil
}

// ExtractDigits extracts all digits from an expression in the order they appear
func (e *ExpressionEvaluator) ExtractDigits(expression string) string {
	var digits strings.Builder
	for _, char := range expression {
		if unicode.IsDigit(char) {
			digits.WriteRune(char)
		}
	}
	return digits.String()
}

// CheckDigitOrder checks if the digits in the expression appear in the same order as in the sequence
func (e *ExpressionEvaluator) CheckDigitOrder(sequence, expression string) bool {
	digits := e.ExtractDigits(expression)
	return digits == sequence
}