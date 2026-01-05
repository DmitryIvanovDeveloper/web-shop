# Localization Module

The Localization module provides multilingual support and regional settings for the application.

## Architecture

The module is built on Domain-Driven Design and Clean Architecture principles:

- **Domain Layer**: Business logic, entities, value objects
- **Application Layer**: Use cases, ports for external dependencies
- **Infrastructure Layer**: Repository implementations, HTTP clients
- **Interface Adapters**: Presenters, View Models, React hooks

## Core Features

### 🌐 Language Support
- 14 pre-configured languages (including RTL: Arabic, Hebrew, Urdu, Farsi)
- Ability to add new languages
- Automatic browser language detection
- Active language management through admin panel

### 📝 Translation Management
- Key-value translation system
- Grouping by modules (auth, products, offers, etc.)
- Bulk translation updates
- Translation status tracking

### 🎯 RTL/LTR Support
- Automatic text direction switching
- UI adaptation for RTL languages
- CSS-in-JS direction support

## Usage

### In React Components

```tsx
import { useTranslation } from '@/modules/localization';

function MyComponent() {
  const { t, direction, currentLanguage } = useTranslation();

  return (
    <div dir={direction}>
      <h1>{t('auth.welcomeTitle', 'Welcome')}</h1>
      <p>{t('auth.welcomeMessage', 'Hello there!')}</p>
      <span>Current language: {currentLanguage?.name}</span>
    </div>
  );
}
```

### In Admin Panel

```tsx
import { LocalizationDashboard } from '@/modules/localization';

function AdminPage() {
  return (
    <div>
      <LocalizationDashboard />
    </div>
  );
}
```

## API Endpoints

### Get Active Language
```
GET /api/localization/active-language
```

### Get Languages List
```
GET /api/localization/languages
```

### Get Translations
```
GET /api/localization/translations?lang=en
```

## Database Schema

### Table `languages`
```sql
CREATE TABLE languages (
  code VARCHAR(5) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  direction VARCHAR(3) CHECK (direction IN ('ltr', 'rtl')),
  is_active BOOLEAN DEFAULT false,
  fallback_code VARCHAR(5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `translations`
```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  is_translated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Adding a New Language

1. Add record to `languages` table
2. Add translations for all keys to `translations` table
3. Restart the application

## Adding New Translations

1. Add keys to application code
2. Create translations via admin panel
3. Update components to use new keys

## Events

- `LanguageActivatedEvent` - language activated
- `LanguageDeactivatedEvent` - language deactivated
- `TranslationUpdatedEvent` - translation updated
- `TranslationCreatedEvent` - translation created

## Extension

To add new features:

1. Add new Value Objects to `domain/value-objects/`
2. Create new Use Cases in `application/use-cases/`
3. Implement Repository methods
4. Update API endpoints
5. Create UI components
