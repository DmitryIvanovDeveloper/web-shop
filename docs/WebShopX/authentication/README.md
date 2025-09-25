# Authentication - Аутентификация

*Система аутентификации и управления пользовательскими сессиями*

---

## 📋 Структура модуля Authentication

### 🎯 Подмодули

| Подмодуль | Описание | Документация |
|-----------|----------|--------------|
| **🔐 User Authentication** | Аутентификация пользователей | [`user-auth/user-auth.md`](./user-auth/user-auth.md) |
| **🔑 Session Management** | Управление сессиями | [`session-management/session-management.md`](./session-management/session-management.md) |

## 🔗 Архитектурные связи

### Clean Architecture слои:
```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  ├── login (UI)                     │
│  ├── register (UI)                  │
│  └── profile (UI)                   │
├─────────────────────────────────────┤
│  Application Layer                  │
│  ├── authentication-service         │
│  ├── session-service                │
│  └── token-validation               │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  ├── jwt-service                    │
│  ├── oauth-providers                │
│  └── password-hashing               │
└─────────────────────────────────────┘
```

### Event-Driven Communication:
- **authentication** → **personalization-engine** (создание профиля)
- **authentication** → **analytics** (отслеживание активности)
- **authentication** → **rewards-system** (начисление наград)

## 🎯 Ключевые особенности

- **🔐 JWT токены** - безопасная аутентификация
- **🌐 OAuth2** - интеграция с внешними провайдерами
- **🔒 Безопасность** - шифрование и защита данных
- **⚡ Автовход** - интеграция с играми и приложениями
- **📱 Multi-platform** - поддержка всех платформ
- **🔄 Refresh токены** - автоматическое обновление сессий

## 📚 Дополнительная информация

- **Общая архитектура проекта**: [`../ecommerce-architecture.md`](../ecommerce-architecture.md)
- **Принципы разработки**: Clean Architecture + Domain-Driven Design
- **Технологический стек**: Next.js 14, TypeScript, JWT, OAuth2, Bcrypt

---

*Документация обновлена: $(Get-Date -Format "dd.MM.yyyy")*



