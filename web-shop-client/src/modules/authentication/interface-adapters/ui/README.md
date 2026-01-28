# Authentication UI Components

Reusable UI components for the authentication module.

## Architecture

Components are divided into three levels:

### 1. Basic Components (Atomic)
- **`AuthPopup`** - authentication modal window

## Hooks

### `useAuth()`
Main hook for working with authentication:
```typescript
const { isAuthenticated, currentUser, initializeAuth, logout } = useAuth();
```


### `useAuthPopup()`
Hook for managing popup state:
```typescript
const { isOpen, openPopup, closePopup, togglePopup } = useAuthPopup();
```

## Usage Examples


### Using Hooks Only
```tsx
import { useAuth } from './hooks';

function AuthStatus() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Hello, {currentUser?.username}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <p>Not authenticated</p>;
}
```

## Reusability Principles

1. **Separation of Concerns**: each component is responsible for one task
2. **Composition**: complex components are assembled from simple ones
3. **Flexibility**: ability to customize through props
4. **Backward Compatibility**: old components continue to work
5. **Simplicity**: avoid unnecessary abstractions and nested functions
6. **Readability**: simplify multiple conditions through functions and chains

## File Structure

```
ui/
├── components/           # Reusable components
│   └── index.ts
├── hooks/               # Reusable hooks
│   ├── use-auth.hook.ts
│   ├── use-auth-popup.hook.ts
│   └── index.ts
├── auth-module.tsx      # Main module
└── README.md           # Documentation
```
