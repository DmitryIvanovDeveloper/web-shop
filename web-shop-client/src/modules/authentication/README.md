# Authentication Module

## Overview
The Authentication module handles user authentication and session management in the client application. It supports app-based login where users are authenticated through URL query parameters (appId and userId) and provides seamless integration with the broader application ecosystem through event-driven communication.

## Architecture
This module follows Clean Architecture principles with clear separation of concerns:

```
authentication/
├── domain/              # Business logic and entities
│   ├── types.ts        # AppUser, AuthUIConfig, validation requests
│   └── errors/         # AuthenticationError and specific error types
├── application/        # Use cases and business rules
│   ├── ports/         # Interfaces for auth repository and session storage
│   ├── services/      # Auth service implementations
│   └── use-cases/     # Authentication operations (validate, save, restore)
├── infrastructure/     # External adapters
│   ├── repositories/   # Supabase auth repository, session storage
│   └── bootstrap/      # DI container configuration
└── interface-adapters/  # UI and external interfaces
    ├── presenters/     # Auth presenter managing UI state
    ├── handlers/       # Event handlers for cross-module communication
    ├── hooks/          # React hooks for auth state
    └── ui/             # Auth components and popup
```

## Domain Layer

### Types

#### `AppUser`
The core domain entity representing an authenticated user.

**Properties:**
- `userId`: Unique user identifier
- `username`: Display name for the user
- `appId`: Application identifier the user belongs to

#### `ValidateAppLoginRequest`
Request object for app-based login validation.

**Properties:**
- `appId`: Application ID (required)
- `userId`: User ID (optional, but required for Supabase flow)

#### `AuthUIConfig`
Configuration for authentication UI components.

**Properties:**
- `version`: Configuration version
- `loginButton`: Button configuration with layout, theme, and styles
- `loginPopup`: Popup configuration for authentication forms

### Errors

#### `AuthenticationError`
Base authentication error class with specific error codes:

**Error Types:**
- `AppIdRequiredError`: AppId is missing or empty
- `InvalidAppIdError`: AppId format is invalid
- `UserNotFoundError`: User doesn't exist in the system
- `AuthenticationError`: Generic authentication failure

## Application Layer

### Use Cases

#### `ValidateAppLoginUseCase`
Validates app-based login credentials and creates/authenticates users.

**Input:**
```typescript
{
  appId: string;    // Required, minimum 3 characters
  userId?: string;  // Required for Supabase flow
}
```

**Process:**
1. Validates appId format and presence
2. Ensures userId is provided (required for authentication)
3. Calls repository to ensure user exists in Supabase
4. Saves session information
5. Publishes UserAuthenticatedEvent for other modules

**Output:**
```typescript
Result<AppUser, AuthenticationError>
```

#### `SaveSessionUseCase`
Persists user session information to storage.

**Input:**
```typescript
AppUser  // User information to save
```

**Process:**
1. Calls session storage port to persist user data
2. Handles storage failures gracefully (doesn't block auth)

#### `RestoreSessionUseCase`
Retrieves saved session information on app startup.

**Process:**
1. Attempts to restore user from storage
2. Validates restored session data
3. Returns user information if session is valid

#### `RestoreSessionAndPublishEventUseCase`
Combines session restoration with event publishing for module initialization.

### Ports

#### `AuthRepositoryPort`
Interface for user authentication and management operations.

```typescript
interface AuthRepositoryPort {
  validateAppId(appId: string): Promise<Result<AppUser, UserNotFoundError>>;
  ensureUserExists(appId: string, userId: string): Promise<Result<{
    user: AppUser;
    isNew: boolean;
    lastActiveAt?: string;
  }, Error>>;
}
```

#### `SessionStoragePort`
Interface for session persistence operations.

```typescript
interface SessionStoragePort {
  save(user: AppUser): Promise<Result<void, Error>>;
  load(): Promise<Result<AppUser | null, Error>>;
  clear(): Promise<Result<void, Error>>;
}
```

## Infrastructure Layer

### Repositories

#### `AuthRepository`
Supabase-based implementation of AuthRepositoryPort.

**Features:**
- User existence validation
- Automatic user creation if not exists
- Last activity timestamp updates
- Error mapping to domain errors

#### `SessionStorageRepository`
Browser storage implementation of SessionStoragePort.

**Features:**
- localStorage persistence
- Session data validation
- Graceful degradation (currently no-op for localStorage writes)

### Bootstrap
Dependency injection configuration in `infrastructure/bootstrap/`:
- `bind.authentication.ts`: Container bindings
- `types.ts`: Type constants for DI

## Interface Adapters Layer

### Presenters

#### `AuthPresenter`
Manages authentication UI state and coordinates with use cases.

**Responsibilities:**
- Authentication state management
- UI state updates (loading, error, success)
- Event handling and state synchronization
- User session state tracking

### Handlers

#### `UserAuthenticatedHandler`
Handles UserAuthenticatedEvent from other modules.

**Actions:**
- Updates internal auth state
- Notifies UI components
- Coordinates with other modules

#### `AppConfigLoadedHandler`
Handles AppConfigLoadedEvent to configure auth UI.

**Actions:**
- Loads auth UI configuration
- Updates presenter with config
- Prepares auth components

#### `AuthenticationRequiredHandler`
Handles authentication requirement events.

**Actions:**
- Shows authentication UI
- Coordinates login flow

### Hooks

#### `useAuth`
React hook for accessing authentication state.

```typescript
const { isAuthenticated, currentUser, isLoading, error } = useAuth();
```

#### `useAuthPopup`
React hook for managing authentication popup state.

```typescript
const { showPopup, hidePopup, isVisible } = useAuthPopup();
```

### UI Components

#### `AuthModule`
Main authentication UI component.

**Features:**
- Login button rendering
- Authentication popup management
- State synchronization with presenter

#### `AuthPopup`
Authentication popup component with form.

**Features:**
- App ID and User ID input fields
- Form validation
- Loading states
- Error display

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/users` | User data retrieval endpoint |

## Usage Examples

### Basic Authentication Check

```typescript
import { container } from '@/infrastructure/bootstrap/container';
import { AUTH_TYPES } from '@/modules/authentication/infrastructure/bootstrap/types';
import { ValidateAppLoginUseCase } from '@/modules/authentication/application/use-cases/validate-app-login.use-case';

const useCase = container.get<ValidateAppLoginUseCase>(
  AUTH_TYPES.ValidateAppLoginUseCase
);

const result = await useCase.execute({
  appId: 'APP123',
  userId: 'user-456'
});

if (result.isSuccess()) {
  const user = result.data;
  console.log('Authenticated user:', user.username);
} else {
  console.error('Authentication failed:', result.error.message);
}
```

### Using Auth Hook in Components

```tsx
import { useAuth } from '@/modules/authentication/interface-adapters/hooks';

function ProtectedComponent() {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please authenticate first</div>;
  }

  return <div>Welcome, {currentUser.username}!</div>;
}
```

### Handling Authentication Events

```typescript
import { UserAuthenticatedEvent } from '@/modules/authentication/domain/events/auth-events';

// In event handler
function handleUserAuthenticated(event: UserAuthenticatedEvent) {
  console.log('User authenticated:', {
    userId: event.userId,
    appId: event.appId,
    isNewUser: event.metadata?.isNewUser
  });

  // Update application state
  updateUserContext(event.userId, event.appId);
}
```

## Data Flow

### Initial Authentication Flow
1. **App Startup** → URL query parameters checked (appId, userId)
2. **ValidateAppLoginUseCase** → Validates credentials
3. **AuthRepository** → Ensures user exists in Supabase
4. **Session Saved** → User data persisted
5. **Event Published** → UserAuthenticatedEvent sent to all modules
6. **UI Updated** → Auth state reflected in components

### Session Restoration Flow
1. **App Reload** → RestoreSessionUseCase called
2. **Session Storage** → Attempt to load saved session
3. **Validation** → Check session validity
4. **State Update** → Auth presenter updated
5. **Event Publishing** → UserAuthenticatedEvent if valid session

## Error Handling

All operations use the `Result<T, E>` pattern:

**Error Handling Strategy:**
1. **Input Validation**: Domain-level validation with specific error types
2. **Network Errors**: Graceful handling with retry capabilities
3. **Storage Errors**: Non-blocking, logged warnings
4. **Event Errors**: Isolated failures don't break authentication

**Common Error Scenarios:**
- Missing appId: `AppIdRequiredError`
- Invalid appId: `InvalidAppIdError`
- Missing userId: `AuthenticationError`
- Supabase errors: Mapped to appropriate domain errors

## Testing

The module supports comprehensive testing:

**Unit Tests:**
- Use case business logic
- Domain entity validation
- Error handling scenarios
- Port interface mocking

**Integration Tests:**
- Repository implementations
- Event publishing/consumption
- Session storage operations

**E2E Tests:**
- Complete authentication flows
- URL parameter handling
- UI state synchronization

## Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  user_id VARCHAR(255) NOT NULL,
  app_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, app_id)
);
```

## Events

### Published Events
- `UserAuthenticatedEvent`: User successfully authenticated
  - Properties: `userId`, `username`, `appId`, `metadata`

### Consumed Events
- `AppConfigLoadedEvent`: App configuration loaded, configure auth UI
- `AuthenticationRequiredEvent`: Authentication needed, show login UI

## Dependencies

### External Dependencies
- `@supabase/supabase-js`: Database operations
- `inversify`: Dependency injection
- `react`: UI framework

### Internal Dependencies
- `shared/result`: Result pattern
- `shared/events`: Event system
- `infrastructure/event-bus`: Event publishing
- `infrastructure/http-client`: HTTP operations

## Security Considerations

### Authentication Method
- **URL-based authentication**: Credentials passed via query parameters
- **Not recommended for production** without additional security measures
- **Should be enhanced** with signed tokens or secure session management

### Data Validation
- AppId minimum length validation
- UserId presence requirement
- Input sanitization and trimming

### Session Management
- Currently no-op localStorage (configurable)
- Should implement proper session tokens
- Consider server-side session validation

## Related Modules

- **App Layout**: Consumes auth state for UI rendering
- **Products**: Uses user context for personalized content
- **Offers**: Requires authenticated users for offer evaluation
- **Analytics**: Tracks user authentication events

## Future Enhancements

- **Enhanced Security**: Implement signed tokens, session validation
- **Multi-factor Authentication**: Add additional verification steps
- **Social Login**: Integrate with OAuth providers
- **Session Management**: Proper session tokens and refresh
- **User Profiles**: Extended user information management
- **Password Authentication**: Traditional username/password flow

## Migration Notes

- **Version 1.0**: Initial app-based authentication implementation
- **Version 1.1**: Added event-driven communication with other modules
- **Version 1.2**: Enhanced error handling and validation
- **Version 2.0**: Planned security enhancements and session management

