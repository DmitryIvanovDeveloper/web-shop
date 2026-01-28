/**
 * Утилиты для обработки действий GrapeJS компонентов
 */

export interface GrapeJsAction {
  type: 'custom' | 'url' | 'javascript' | 'navigate';
  handler?: string;
  url?: string;
  code?: string;
  params?: Record<string, any>;
}

/**
 * Обрабатывает действие компонента
 */
export function handleGrapeJsAction(action: GrapeJsAction): void {
  if (!action) {
    console.warn('[GrapeJsActions] No action provided');
    return;
  }

  console.log('[GrapeJsActions] Handling action:', action);

  try {
    switch (action.type) {
      case 'custom':
        handleCustomAction(action);
        break;

      case 'url':
        handleUrlAction(action);
        break;

      case 'javascript':
        handleJavaScriptAction(action);
        break;

      case 'navigate':
        handleNavigateAction(action);
        break;

      default:
        console.warn('[GrapeJsActions] Unknown action type:', action.type);
    }
  } catch (error) {
    console.error('[GrapeJsActions] Action execution failed:', error);
  }
}

/**
 * Обрабатывает кастомные действия
 */
function handleCustomAction(action: GrapeJsAction): void {
  const handler = action.handler;

  if (!handler) {
    console.warn('[GrapeJsActions] Custom action without handler');
    return;
  }

  switch (handler) {
    case 'navigateToHome':
      navigateTo('/');
      break;

    case 'navigateToStore':
      navigateTo('/store');
      break;

    case 'navigateToPatchNotes':
      navigateTo('/patch-notes');
      break;

    case 'navigateToDailyRewards':
      navigateTo('/daily-rewards');
      break;

    case 'navigateToLoyaltyProgram':
      navigateTo('/loyalty-program');
      break;

    case 'navigateToNews':
      navigateTo('/news');
      break;

    case 'navigateToUpdates':
      navigateTo('/updates');
      break;

    case 'navigateToEvents':
      navigateTo('/events');
      break;

    default:
      console.warn('[GrapeJsActions] Unknown custom handler:', handler);
      // Попытаться выполнить как функцию если она существует глобально
      if (typeof window !== 'undefined' && (window as any)[handler]) {
        (window as any)[handler](action.params);
      }
  }
}

/**
 * Обрабатывает URL действия
 */
function handleUrlAction(action: GrapeJsAction): void {
  const url = action.url;

  if (!url) {
    console.warn('[GrapeJsActions] URL action without url');
    return;
  }

  if (url.startsWith('http') || url.startsWith('//')) {
    // Внешняя ссылка
    window.open(url, '_blank');
  } else {
    // Внутренняя ссылка
    navigateTo(url);
  }
}

/**
 * Обрабатывает JavaScript действия
 * ВНИМАНИЕ: Это может быть небезопасно!
 */
function handleJavaScriptAction(action: GrapeJsAction): void {
  const code = action.code;

  if (!code) {
    console.warn('[GrapeJsActions] JavaScript action without code');
    return;
  }

  // ВНИМАНИЕ: eval() может быть опасным!
  // В продакшене это должно быть ограничено доверенным контентом
  console.warn('[GrapeJsActions] Executing JavaScript code:', code);

  try {
    // Создаем безопасный контекст выполнения
    const safeEval = new Function('params', `return (${code})`);
    safeEval(action.params || {});
  } catch (error) {
    console.error('[GrapeJsActions] JavaScript execution failed:', error);
  }
}

/**
 * Обрабатывает действия навигации
 */
function handleNavigateAction(action: GrapeJsAction): void {
  const url = action.url || action.handler;

  if (!url) {
    console.warn('[GrapeJsActions] Navigate action without url');
    return;
  }

  navigateTo(url);
}

/**
 * Универсальная функция навигации
 */
function navigateTo(url: string): void {
  if (typeof window === 'undefined') return;

  console.log('[GrapeJsActions] Navigating to:', url);

  // Проверяем, есть ли роутер Next.js
  if ((window as any).next && (window as any).next.router) {
    (window as any).next.router.push(url);
  } else {
    // Fallback to window.location
    window.location.href = url;
  }
}

/**
 * Регистрирует кастомные обработчики действий
 */
export function registerCustomActionHandler(
  handlerName: string,
  handlerFn: (params?: any) => void
): void {
  if (typeof window === 'undefined') return;

  (window as any)[handlerName] = handlerFn;
  console.log('[GrapeJsActions] Registered custom action handler:', handlerName);
}

/**
 * Создает обработчик клика для React компонента
 */
export function createClickHandler(action?: GrapeJsAction) {
  return (event?: React.MouseEvent) => {
    if (action) {
      handleGrapeJsAction(action);
    }
  };
}

/**
 * Валидирует действие
 */
export function validateAction(action: any): action is GrapeJsAction {
  return (
    action &&
    typeof action === 'object' &&
    typeof action.type === 'string' &&
    ['custom', 'url', 'javascript', 'navigate'].includes(action.type)
  );
}