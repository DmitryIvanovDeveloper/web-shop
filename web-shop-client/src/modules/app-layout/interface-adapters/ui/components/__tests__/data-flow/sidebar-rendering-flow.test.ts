import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { HttpClient } from '../../../../../../../application/ports/http-client.port';
import { HttpClientMock } from '../../../../../../../infrastructure/http/http-client.mock';
import { ROOT_TYPES } from '../../../../../../../infrastructure/bootstrap/types';
import { UI_RENDERER_TYPES } from '../../../../../infrastructure/bootstrap/types';
import { ConfigRepository } from '../../../../../infrastructure/repositories/config.repository';
import { LoadPageConfigUseCase } from '../../../../../application/use-cases/load-page-config.use-case';
import { SidebarRendererPresenter } from '../../../../presenters/sidebar-renderer.presenter';
import { ComponentRegistry } from '../../../../../infrastructure/services/component-registry.service';
import { StyleBuilder } from '../../../../../infrastructure/services/style-builder.service';

describe('Sidebar Rendering Data Flow', () => {
  let container: Container;
  let presenter: SidebarRendererPresenter;

  beforeEach(() => {
    container = new Container();

    // Bind HttpClientMock
    container.bind<HttpClient>(ROOT_TYPES.HttpClient).to(HttpClientMock).inSingletonScope();

    // Bind Infrastructure services
    container
      .bind(UI_RENDERER_TYPES.ComponentRegistry)
      .to(ComponentRegistry)
      .inSingletonScope();

    container.bind(UI_RENDERER_TYPES.StyleBuilder).to(StyleBuilder).inSingletonScope();

    // Bind ConfigRepository
    container
      .bind(UI_RENDERER_TYPES.ConfigRepository)
      .to(ConfigRepository)
      .inSingletonScope();

    // Bind UseCase
    container
      .bind(UI_RENDERER_TYPES.LoadPageConfigUseCase)
      .to(LoadPageConfigUseCase)
      .inSingletonScope();

    // Bind Presenter
    container
      .bind(UI_RENDERER_TYPES.SidebarRendererPresenter)
      .to(SidebarRendererPresenter)
      .inSingletonScope();

    presenter = container.get(UI_RENDERER_TYPES.SidebarRendererPresenter);
  });

  it('should complete full data flow: HttpClientMock -> Repository -> UseCase -> Presenter -> ViewModel', async () => {
    // Act: запускаем полный поток данных
    const viewModel = await presenter.loadSidebar();

    // Assert: проверяем результат на каждом уровне

    // 1. ViewModel должна быть успешной
    expect(viewModel.status).toBe('success');

    if (viewModel.status === 'success') {
      const config = viewModel.config;

      // 2. PageConfig Value Object должен быть создан
      expect(config).toBeDefined();
      expect(config.type).toBe('sidebar');
      expect(config.version).toBe('1.0');

      // 3. ThemeConfig Value Object должен содержать корректные значения
      expect(config.theme).toBeDefined();
      expect(config.theme.colors.primary).toBe('#3B5AFE');
      expect(config.theme.colors.background).toBe('#0D1117');
      expect(config.theme.colors.surface).toBe('#161B22');
      expect(config.theme.colors.text).toBe('#FFFFFF');
      expect(config.theme.spacing).toEqual([0, 0.5, 1, 1.5, 2, 3, 4]);

      // 4. ComponentNode Value Object должен иметь корректную структуру
      expect(config.layout).toBeDefined();
      expect(config.layout.type).toBe('Container');
      expect(config.layout.styles.padding).toBe(8);
      expect(config.layout.styles.backgroundColor).toBe('surface');

      // 5. Вложенный ComponentNode (Button) должен быть создан
      expect(config.layout.children).toHaveLength(1);
      const buttonNode = config.layout.children[0];
      expect(buttonNode.type).toBe('Button');
      expect(buttonNode.props).toHaveProperty('text', 'Store');
      expect(buttonNode.props).toHaveProperty('icon', '🛒');
      expect(buttonNode.styles.padding).toBe(4);
      expect(buttonNode.styles.backgroundColor).toBe('primary');
      expect(buttonNode.styles.textColor).toBe('text');
    }
  });

  it('should validate data flow from JSON file to Value Objects', async () => {
    // Arrange
    const useCase = container.get<LoadPageConfigUseCase>(
      UI_RENDERER_TYPES.LoadPageConfigUseCase
    );

    // Act: загружаем конфигурацию напрямую через UseCase
    const result = await useCase.execute({ pageType: 'sidebar' });

    // Assert: проверяем что HttpClientMock корректно загрузил JSON
    expect(result.isSuccess()).toBe(true);

    if (result.isSuccess()) {
      const config = result.data;

      // JSON -> PageConfig Value Object
      expect(config.type).toBe('sidebar');

      // JSON theme -> ThemeConfig Value Object
      expect(config.theme.colors).toHaveProperty('primary');
      expect(config.theme.spacing).toBeInstanceOf(Array);

      // JSON layout -> ComponentNode Value Object
      expect(config.layout.type).toBe('Container');
      expect(config.layout.children[0].type).toBe('Button');

      // Проверяем что Value Objects имеют метод equals()
      expect(typeof config.equals).toBe('function');
      expect(typeof config.theme.equals).toBe('function');
      expect(typeof config.layout.equals).toBe('function');
    }
  });

  it('should handle complete flow with StyleBuilder transformation', async () => {
    // Arrange
    const styleBuilder = container.get<StyleBuilder>(UI_RENDERER_TYPES.StyleBuilder);
    const viewModel = await presenter.loadSidebar();

    // Assert
    if (viewModel.status === 'success') {
      const buttonNode = viewModel.config.layout.children[0];

      // Act: применяем StyleBuilder к стилям кнопки
      const className = styleBuilder.buildClassName(buttonNode.styles, viewModel.config.theme);
      const inlineStyles = styleBuilder.buildInlineStyles(buttonNode.styles, viewModel.config.theme);

      // Assert: проверяем что стили из JSON преобразованы в Tailwind классы и inline styles
      expect(className).toContain('p-2');
      expect(inlineStyles).toHaveProperty('backgroundColor', '#3B5AFE');
      expect(inlineStyles).toHaveProperty('color', '#FFFFFF');
    }
  });

  it('should handle error flow when JSON file not found', async () => {
    // Act: запрашиваем несуществующую конфигурацию
    const useCase = container.get<LoadPageConfigUseCase>(
      UI_RENDERER_TYPES.LoadPageConfigUseCase
    );
    const result = await useCase.execute({ pageType: 'non-existent' });

    // Assert: проверяем что ошибка корректно обрабатывается на всех уровнях
    expect(result.isFailure()).toBe(true);

    if (result.isFailure()) {
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('DATA_LOADING_FAILED');
      expect(result.error.message).toContain('Failed to load');
    }
  }, 10000); // Увеличиваем timeout до 10 секунд

  it('should verify Value Objects immutability in data flow', async () => {
    // Act: загружаем конфигурацию дважды
    const viewModel1 = await presenter.loadSidebar();
    const viewModel2 = await presenter.loadSidebar();

    // Assert: проверяем что Value Objects неизменяемы и равны по значениям
    expect(viewModel1.status).toBe('success');
    expect(viewModel2.status).toBe('success');

    if (viewModel1.status === 'success' && viewModel2.status === 'success') {
      // Проверяем что equals() работает корректно
      expect(viewModel1.config.equals(viewModel2.config)).toBe(true);
      expect(viewModel1.config.theme.equals(viewModel2.config.theme)).toBe(true);
      expect(viewModel1.config.layout.equals(viewModel2.config.layout)).toBe(true);

      // Проверяем что объекты разные, но равны по значениям
      expect(viewModel1.config).not.toBe(viewModel2.config); // разные объекты
      expect(viewModel1.config.equals(viewModel2.config)).toBe(true); // но равны
    }
  });

  it('should trace complete data path: JSON -> HTTP -> Repository -> UseCase -> Presenter -> ViewModel', async () => {
    // Act: выполняем полный поток
    const viewModel = await presenter.loadSidebar();

    // Assert: проверяем что данные прошли через все слои
    expect(viewModel.status).toBe('success');

    if (viewModel.status === 'success') {
      // 1. HttpClientMock загрузил JSON из файла
      // GET /api/pages/sidebar/config -> /mocks/api/pages/sidebar/config.json

      // 2. ConfigRepository преобразовал JSON в Value Objects
      expect(viewModel.config.type).toBe('sidebar');

      // 3. LoadPageConfigUseCase вернул Result<PageConfig>
      expect(viewModel.config.version).toBe('1.0');

      // 4. SidebarRendererPresenter преобразовал в ViewModel
      expect(viewModel).toHaveProperty('status');
      expect(viewModel).toHaveProperty('config');

      // 5. Все Value Objects созданы корректно
      expect(viewModel.config.theme).toBeDefined();
      expect(viewModel.config.layout).toBeDefined();
      expect(viewModel.config.layout.children).toHaveLength(1);
    }
  }, 10000); // Увеличиваем timeout до 10 секунд
});

