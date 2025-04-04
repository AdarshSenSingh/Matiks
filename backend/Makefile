.PHONY: build run dev clean test

# Build the application
build:
	go build -o bin/server cmd/server/main.go

# Run the application
run: build
	./bin/server

# Run the application with hot reload using air (requires air: https://github.com/cosmtrek/air)
dev:
	air -c .air.toml

# Clean build artifacts
clean:
	rm -rf bin/

# Run tests
test:
	go test -v ./...

# Download dependencies
deps:
	go mod download

# Initialize the database (requires PostgreSQL)
init-db:
	psql -U postgres -c "CREATE DATABASE hectoclash;"

# Help
help:
	@echo "Available commands:"
	@echo "  make build     - Build the application"
	@echo "  make run       - Run the application"
	@echo "  make dev       - Run the application with hot reload (requires air)"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make test      - Run tests"
	@echo "  make deps      - Download dependencies"
	@echo "  make init-db   - Initialize the database (requires PostgreSQL)"
