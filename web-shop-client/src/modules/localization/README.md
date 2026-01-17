# Localization Module

Lightweight localization for the web client: loads translations over HTTP, updates a presenter via events, and exposes a small translation service/hook.

## Architecture
- **Domain**: `Language`, `Translation`, VOs (`language-code`, `text-direction`, `translation-key`), events `LocalizationLoadedEvent`, `LocalizationChangedEvent`.
- **Application / ports**: `TranslationRepositoryPort`, `LanguageRepositoryPort`, `BrowserLanguageDetectorPort`.
- **Application / use-cases**: `LoadLocalizationUseCase` (initial load), `ChangeLocalizationUseCase` (switch language).
- **Infrastructure**: HTTP repositories (`translation-http.repository`, `language-http.repository`), browser language service, DI bindings in `infrastructure/bootstrap/bind.localization.ts`.
- **Interface adapters**: `LocalizationPresenter`, event handlers (`localization-loaded.handler`, `localization-changed.handler`), view model, UI samples (`LanguageSelector`, `LocalizationDashboard`, `LocalizationExample`), translation service.

## Data flow (what really happens)
1) UI calls `LocalizationPresenter.loadLocalization(languageCode?)`.
2) `LoadLocalizationUseCase` fetches translations via `TranslationRepository.getTranslationsByLanguage(lang)` → `/api/localization/translations?lang=${lang}`.
3) Publishes `LocalizationLoadedEvent` through EventBus; the handler updates `LocalizationPresenter` state (`translations`, `currentLanguage`, `direction`).
4) Presenter sets `document.documentElement.dir/lang` (browser).
5) `TranslationService.t(key, fallback)` reads from the presenter’s view model; if missing, returns `fallback` or the key.
6) `ChangeLocalizationUseCase` repeats the flow and publishes `LocalizationChangedEvent`.

## Direction / language
- Direction is computed as `rtl` only for `ar`; everything else defaults to `ltr` (no per-language direction table).
- Default language is `en` if none is provided.
- Browser-language detection port exists, but the shipped flow uses the explicit languageCode passed in.

## HTTP endpoints used
- `GET /api/localization/translations?lang={code}`
- `GET /api/localization/active-language`
- `GET /api/localization/languages`

## Usage
```tsx
import { container } from '@/infrastructure/bootstrap/container';
import { LOCALIZATION_TYPES } from './infrastructure/bootstrap/types';
import { createTranslationService } from './application/services/translation.service';

const presenter = container.get(LOCALIZATION_TYPES.LocalizationPresenter);
await presenter.loadLocalization('en');
const t = createTranslationService(presenter).t;

// In component:
// <div dir={presenter.viewModel.direction}>{t('auth.welcomeTitle', 'Welcome')}</div>
```

## Known limitations
- Only `ar` is treated as RTL; other RTL languages are not auto-detected.
- No fallback chaining: if a key is missing, `t` returns `fallback` or the key itself.
- No built-in admin UI wiring; `TranslationEditor`/`LocalizationDashboard` are sample components and require the above endpoints to exist.
- Repository retries translations fetch up to 3 times; errors are logged but not cached.
- There is no shipped `useTranslation` hook; use the presenter + `createTranslationService` manually.
- `BrowserLanguageDetectorPort` exists, but the browser service is not wired into use-cases—language must be passed explicitly to `loadLocalization`/`changeLocalization`.
