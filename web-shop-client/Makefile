# Development commands
.PHONY: help dev build start lint test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm run start

# Quality checks
lint: ## Run ESLint
	npm run lint

lint-strict: ## Run ESLint with strict rules (no warnings allowed)
	npm run lint:strict

type-check: ## Run TypeScript type checking
	npm run type-check

type-check-strict: ## Run strict TypeScript type checking
	npm run type-check:strict

type-check-ci: ## Run TypeScript type checking like in CI
	npm run type-check:ci

quality: lint type-check ## Run all quality checks

quality-strict: lint-strict type-check-strict ## Run all strict quality checks

pre-commit: quality-strict ## Run all checks before commit

# Testing
test: ## Run all tests
	npm run test

test-unit: ## Run unit tests only
	npm run test:unit

test-integration: ## Run integration tests only
	npm run test:integration

test-e2e: ## Run end-to-end tests only
	npm run test:e2e

test-coverage: ## Run tests with coverage
	npm run test:coverage

test-watch: ## Run tests in watch mode
	npm run test:watch

# Maintenance
clean: ## Clean build artifacts and caches
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf .swc
	rm -rf dist

clean-all: clean ## Clean everything including node_modules
	rm -rf node_modules
	rm -rf package-lock.json

install: ## Install dependencies
	npm install

install-clean: clean-all install ## Clean install all dependencies

# CI simulation
ci: clean install quality-strict test ## Simulate CI pipeline

# Development helpers
format: ## Format code with Prettier
	npx prettier --write .

format-check: ## Check code formatting
	npx prettier --check .

update-deps: ## Update dependencies
	npx npm-check-updates -u

audit: ## Audit dependencies for security issues
	npm audit

audit-fix: ## Fix security issues in dependencies
	npm audit fix