# Daily Rewards Module

Модуль ежедневных наград предоставляет функциональность для отображения и управления ежедневными наградами в приложении.

## Компоненты

### DailyRewardCard

Компонент карточки для отображения ежедневной награды с номером дня и множителем.

```tsx
import { DailyRewardCard } from '@modules/daily-rewards';

<DailyRewardCard day={1} multiplier={10} />
```

**Пропсы:**
- `day: number` - номер дня (1, 2, 3, ...)
- `multiplier: number` - множитель награды (1, 2, 5, 10, ...)

**Стили:**
- Размер: 120x150px
- Светлый фон (#f9f9f9)
- Закругленные углы
- Тень для объема

### DailyRewardsCardsGrid

Компонент для отображения сетки карточек наград.

```tsx
import { DailyRewardsCardsGrid } from '@modules/daily-rewards';

const rewards = [
  { day: 1, multiplier: 1 },
  { day: 2, multiplier: 2 },
  { day: 3, multiplier: 3 },
];

<DailyRewardsCardsGrid rewards={rewards} />
```

**Пропсы:**
- `rewards: Array<{day: number, multiplier: number}>` - массив наград

### DailyRewardsList

Компонент для отображения списка наград в виде карточек с дополнительной информацией.

```tsx
import { DailyRewardsList } from '@modules/daily-rewards';

<DailyRewardsList
  rewards={rewards}
  labels={presenter.labels}
/>
```

## Страницы

### /daily-rewards

Основная страница с двумя режимами отображения:
- **Cards View**: показывает карточки типа DailyRewardCard в сетке
- **List View**: показывает подробный список наград

### /daily-rewards-demo

Демо-страница для тестирования компонентов DailyRewardCard и DailyRewardsCardsGrid.

## API Endpoints

### GET /api/daily-rewards?appId={appId}

Возвращает список всех наград для указанного приложения.

**Ответ:**
```json
{
  "rewards": [
    {
      "id": "string",
      "appId": "string",
      "type": "points|currency|item",
      "title": "string",
      "description": "string",
      "points": number,
      "isActive": boolean,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

## Использование

### В React компоненте

```tsx
import {
  DailyRewardCard,
  DailyRewardsCardsGrid,
  DailyRewardsList
} from '@modules/daily-rewards';

function MyComponent() {
  const rewards = [
    { day: 1, multiplier: 1 },
    { day: 2, multiplier: 2 },
    { day: 3, multiplier: 5 },
  ];

  return (
    <div>
      {/* Отдельная карточка */}
      <DailyRewardCard day={1} multiplier={10} />

      {/* Сетка карточек */}
      <DailyRewardsCardsGrid rewards={rewards} />

      {/* Список с дополнительной информацией */}
      <DailyRewardsList rewards={rewards} labels={labels} />
    </div>
  );
}
```

### В Next.js странице

```tsx
// app/daily-rewards/page.tsx
import { DailyRewardsPage } from '@modules/daily-rewards';

export default function DailyRewards() {
  return <DailyRewardsPage />;
}
```

## Архитектура

Модуль построен по принципам Clean Architecture:

- **Domain**: бизнес-логика (сущности, правила)
- **Application**: use cases (бизнес-сценарии)
- **Interface Adapters**: presenters, UI компоненты
- **Infrastructure**: репозитории, API клиенты

## Стилизация

Компоненты используют встроенные стили (inline styles) для обеспечения консистентности и простоты интеграции. Все цвета и размеры соответствуют дизайн-системе приложения.
