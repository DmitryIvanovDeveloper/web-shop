# Authentication UI Components

Переиспользуемые UI компоненты для модуля авторизации.

## Архитектура

Компоненты разделены на три уровня:

### 1. Базовые компоненты (Atomic)
- **`AuthPopup`** - модальное окно авторизации

## Хуки

### `useAuth()`
Основной хук для работы с авторизацией:
```typescript
const { isAuthenticated, currentUser, initializeAuth, logout } = useAuth();
```


### `useAuthPopup()`
Хук для управления состоянием popup:
```typescript
const { isOpen, openPopup, closePopup, togglePopup } = useAuthPopup();
```

## Примеры использования


### Использование только хуков
```tsx
import { useAuth } from './hooks';

function AuthStatus() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Привет, {currentUser?.username}!</p>
        <button onClick={logout}>Выйти</button>
      </div>
    );
  }

  return <p>Не авторизован</p>;
}
```

## Принципы переиспользования

1. **Разделение ответственности**: каждый компонент отвечает за одну задачу
2. **Композиция**: сложные компоненты собираются из простых
3. **Гибкость**: возможность кастомизации через пропсы
4. **Обратная совместимость**: старые компоненты продолжают работать
5. **Простота**: избегаем лишних абстракций и вложенных функций
6. **Читаемость**: упрощаем множественные условия через функции и цепочки

## Структура файлов

```
ui/
├── components/           # Переиспользуемые компоненты
│   └── index.ts
├── hooks/               # Переиспользуемые хуки
│   ├── use-auth.hook.ts
│   ├── use-auth-popup.hook.ts
│   └── index.ts
├── auth-module.tsx      # Основной модуль
└── README.md           # Документация
```
