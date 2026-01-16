# Localization Module (Merchant Admin)

## Overview
The Localization module provides merchant admin functionality for managing multilingual content and language settings. It allows administrators to configure supported languages, manage translations, and control language activation/deactivation for their applications.

## Architecture
This module follows Clean Architecture principles with clear separation of concerns:

```
localization/
├── domain/              # Business logic and entities
│   ├── entities/       # Language, Translation entities
│   ├── value-objects/  # LanguageCode, TextDirection, TranslationKey
│   ├── errors/         # Domain-specific localization errors
│   └── events/         # Localization domain events
├── application/        # Use cases and business rules
│   ├── ports/         # Repository interfaces
│   └── use-cases/     # Language and translation management
├── infrastructure/     # External adapters
│   ├── repositories/   # Supabase repository implementations
│   └── bootstrap/      # DI container configuration
└── interface-adapters/  # UI and external interfaces
    ├── presenters/     # Localization presenter
    ├── view-models/    # UI state management
    └── views/          # React admin components
```

## Domain Layer

### Entities

#### `Language`
Represents a supported language in the system.

**Properties:**
- `code`: LanguageCode (ISO language code)
- `name`: Display name (e.g., "English")
- `nativeName`: Native language name (e.g., "العربية")
- `direction`: TextDirection (LTR/RTL)
- `isActive`: Whether language is currently active
- `fallbackCode`: Optional fallback language code

**Methods:**
- `activate()`: Creates activated version of language
- `deactivate()`: Creates deactivated version of language
- `update(details)`: Creates updated version with new details
- `isRTL()`: Checks if language uses right-to-left text
- `hasFallback()`: Checks if language has fallback configured

**Factory Methods:**
- `create()`: Creates new language with validation
- `fromDatabase()`: Creates language from database data

#### `Translation`
Represents a single translation entry.

**Properties:**
- `id`: Unique translation identifier
- `key`: TranslationKey (structured key like "auth.login")
- `languageCode`: Target language code
- `value`: Translated text
- `isTranslated`: Whether translation is complete
- `createdAt`/`updatedAt`: Timestamps

### Value Objects

#### `LanguageCode`
Value object for language code validation.

**Validation Rules:**
- Must be valid ISO language code (2-5 characters)
- Must be lowercase

#### `TextDirection`
Value object for text direction.

**Values:**
- `LTR` (Left-to-Right)
- `RTL` (Right-to-Left)

**Methods:**
- `isRTL()`: Returns true for RTL languages
- `isLTR()`: Returns true for LTR languages

#### `TranslationKey`
Value object for translation key validation.

**Validation Rules:**
- Must contain only alphanumeric characters, dots, underscores, hyphens
- Must be lowercase
- Maximum length: 255 characters

### Errors

#### `LocalizationError`
Base error class with specific error types:

- `LanguageNotFoundError`: Language doesn't exist
- `LanguageAlreadyExistsError`: Language code already in use
- `LanguageValidationError`: Invalid language data
- `TranslationNotFoundError`: Translation key not found
- `TranslationValidationError`: Invalid translation data

## Application Layer

### Use Cases

#### `ChangeActiveLanguageUseCase`
Changes the currently active language for the application.

**Input:**
```typescript
{
  languageCode: string;  // ISO language code
}
```

**Process:**
1. Validates language code exists
2. Gets current active language
3. If different, activates new language (auto-deactivates others)
4. Returns success

**Output:**
```typescript
Result<void, Error>
```

#### `GetLocalizationStatusUseCase`
Retrieves comprehensive localization status for admin dashboard.

**Input:**
```typescript
{
  appId?: string;  // Optional app filter
}
```

**Output:**
```typescript
Result<{
  languages: Language[];
  translations: {
    languageCode: string;
    totalKeys: number;
    translatedKeys: number;
    completionPercentage: number;
  }[];
  activeLanguage: Language;
}, Error>
```

#### `UpdateTranslationsUseCase`
Bulk updates translations for multiple languages.

**Input:**
```typescript
{
  translations: Array<{
    key: string;
    languageCode: string;
    value: string;
  }>;
}
```

**Process:**
1. Validates all translation data
2. Updates translations in batch
3. Returns success/failure counts

### Ports

#### `LanguageRepositoryPort`
Interface for language data operations.

```typescript
interface LanguageRepositoryPort {
  getAll(): Promise<Result<Language[], Error>>;
  getByCode(code: string): Promise<Result<Language | null, Error>>;
  getActiveLanguage(): Promise<Result<Language | null, Error>>;
  activateLanguage(code: string): Promise<Result<void, Error>>;
  deactivateLanguage(code: string): Promise<Result<void, Error>>;
  create(language: Language): Promise<Result<Language, Error>>;
  update(code: string, details: LanguageUpdate): Promise<Result<Language, Error>>;
}
```

#### `TranslationRepositoryPort`
Interface for translation data operations.

```typescript
interface TranslationRepositoryPort {
  getByLanguage(languageCode: string): Promise<Result<Translation[], Error>>;
  getByKey(key: string): Promise<Result<Translation[], Error>>;
  getByKeyAndLanguage(key: string, languageCode: string): Promise<Result<Translation | null, Error>>;
  create(translations: Translation[]): Promise<Result<Translation[], Error>>;
  update(updates: TranslationUpdate[]): Promise<Result<void, Error>>;
  getTranslationStats(): Promise<Result<TranslationStats[], Error>>;
}
```

## Infrastructure Layer

### Repositories

#### `LanguageRepository`
Supabase implementation of LanguageRepositoryPort.

**Features:**
- Full CRUD operations for languages
- Active language management
- Data validation and error mapping
- Batch operations support

#### `TranslationRepository`
Supabase implementation of TranslationRepositoryPort.

**Features:**
- Translation CRUD operations
- Bulk update capabilities
- Statistics generation
- Language-key relationship management

### Database Schema

#### Table: `languages`
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

#### Table: `translations`
```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  language_code VARCHAR(5) NOT NULL REFERENCES languages(code),
  value TEXT NOT NULL,
  is_translated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(key, language_code)
);
```

## Interface Adapters Layer

### Presenters

#### `LocalizationPresenter`
Manages localization admin UI state and coordinates with use cases.

**Responsibilities:**
- Language management (add/edit/activate/deactivate)
- Translation bulk operations
- Status dashboard data
- Error handling and user feedback

### View Models

#### `LocalizationViewModel`
UI state representation for localization admin interface.

**Properties:**
- `languages`: Available languages list
- `activeLanguage`: Currently active language
- `translations`: Translation data by language
- `stats`: Translation completion statistics
- `loading`: Loading states
- `errors`: Error messages

### Views

#### `LocalizationDashboard`
Main admin dashboard component.

**Features:**
- Language selector and management
- Translation editor with bulk operations
- Status overview with completion percentages
- Real-time updates

#### `LanguageSelector`
Component for selecting and managing languages.

**Features:**
- Language list display
- Activate/deactivate controls
- Add new language form

#### `TranslationEditor`
Component for editing translations.

**Features:**
- Bulk translation editing
- Language-specific views
- Save/cancel operations
- Validation feedback

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/localization/languages` | Get all languages |
| GET | `/api/localization/active-language` | Get active language |
| POST | `/api/localization/activate-language` | Change active language |
| GET | `/api/localization/translations` | Get translations by language |
| PUT | `/api/localization/translations` | Update translations |

## Usage Examples

### Changing Active Language

```typescript
import { container } from '@/infrastructure/bootstrap/container';
import { LOCALIZATION_TYPES } from '@/modules/localization/infrastructure/bootstrap/types';
import { ChangeActiveLanguageUseCase } from '@/modules/localization/application/use-cases/change-active-language.use-case';

const useCase = container.get<ChangeActiveLanguageUseCase>(
  LOCALIZATION_TYPES.ChangeActiveLanguageUseCase
);

const result = await useCase.execute({
  languageCode: 'ar'
});

if (result.isSuccess()) {
  console.log('Language changed successfully');
} else {
  console.error('Failed to change language:', result.error.message);
}
```

### Getting Localization Status

```typescript
import { GetLocalizationStatusUseCase } from '@/modules/localization/application/use-cases/get-localization-status.use-case';

const statusUseCase = container.get<GetLocalizationStatusUseCase>(
  LOCALIZATION_TYPES.GetLocalizationStatusUseCase
);

const result = await statusUseCase.execute({});

if (result.isSuccess()) {
  const { languages, translations, activeLanguage } = result.data;
  console.log(`Active language: ${activeLanguage.name}`);
  console.log(`Total languages: ${languages.length}`);
}
```

### Updating Translations

```typescript
import { UpdateTranslationsUseCase } from '@/modules/localization/application/use-cases/update-translations.use-case';

const updateUseCase = container.get<UpdateTranslationsUseCase>(
  LOCALIZATION_TYPES.UpdateTranslationsUseCase
);

const result = await updateUseCase.execute({
  translations: [
    { key: 'auth.login', languageCode: 'es', value: 'Iniciar sesión' },
    { key: 'auth.logout', languageCode: 'es', value: 'Cerrar sesión' }
  ]
});

if (result.isSuccess()) {
  console.log('Translations updated successfully');
}
```

## Data Flow

### Language Activation Flow
1. **Admin selects language** → ChangeActiveLanguageUseCase called
2. **Validate language exists** → Repository lookup
3. **Update active status** → Database transaction
4. **Return success** → UI updated

### Translation Update Flow
1. **Admin edits translations** → UpdateTranslationsUseCase called
2. **Validate translation data** → Domain validation
3. **Bulk database update** → Repository operations
4. **Return results** → UI shows success/failure counts

### Status Dashboard Flow
1. **Dashboard loads** → GetLocalizationStatusUseCase called
2. **Fetch languages** → Repository queries
3. **Calculate statistics** → Translation analysis
4. **Return comprehensive data** → UI renders dashboard

## Error Handling

All operations use the `Result<T, E>` pattern:

**Error Handling Strategy:**
1. **Domain Validation**: Immediate failure with specific error types
2. **Database Errors**: Mapped to appropriate domain errors
3. **Network Errors**: Retry logic with exponential backoff
4. **Bulk Operations**: Partial success handling with detailed reporting

**Common Error Scenarios:**
- Invalid language codes: `LanguageValidationError`
- Non-existent languages: `LanguageNotFoundError`
- Database constraints: Mapped to domain errors
- Network failures: Graceful degradation

## Testing

The module supports comprehensive testing:

**Unit Tests:**
- Domain entity validation
- Use case business logic
- Repository interface mocking
- Error handling scenarios

**Integration Tests:**
- Repository implementations
- Database operations
- API endpoint testing

**E2E Tests:**
- Admin dashboard interactions
- Language switching workflows
- Translation management flows

## Dependencies

### External Dependencies
- `@supabase/supabase-js`: Database client
- `inversify`: Dependency injection
- `react`: UI framework

### Internal Dependencies
- `shared/result`: Result pattern
- `shared/domain`: Base entity classes
- `infrastructure/http-client`: HTTP operations
- `infrastructure/database`: Database abstractions

## Events

### Published Events (Planned)
- `LanguageActivatedEvent`: Language activated
- `LanguageDeactivatedEvent`: Language deactivated
- `TranslationUpdatedEvent`: Translations updated

### Consumed Events
- `AppConfigLoadedEvent`: Application configuration loaded

## Security Considerations

### Data Validation
- Language code format validation
- Translation key sanitization
- Input length limits
- SQL injection prevention through parameterized queries

### Access Control
- Admin-only operations
- App-scoped data isolation
- Audit logging for changes

## Related Modules

- **Client Localization Module**: Consumes language and translation data
- **Analytics Module**: Tracks language usage and translation effectiveness
- **Merchant Admin**: Provides admin interface for localization management

## Future Enhancements

- **Translation Memory**: Reuse similar translations
- **Machine Translation**: AI-assisted translation suggestions
- **Import/Export**: Bulk translation file operations
- **Translation Workflows**: Multi-user translation approval processes
- **RTL Language Support**: Enhanced RTL UI components
- **Translation Context**: Show translation usage context
- **Translation History**: Track translation changes over time

## Migration Notes

- **Version 1.0**: Initial localization management implementation
- **Version 1.1**: Added bulk translation operations
- **Version 1.2**: Enhanced error handling and validation
- **Version 2.0**: Planned event-driven architecture and real-time updates


