import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { ROOT_TYPES } from '../../../../../../../infrastructure/bootstrap/types';
import { UI_RENDERER_TYPES } from '../../../../../infrastructure/bootstrap/types';
import { LoadPageConfigUseCase } from '../../../../../application/use-cases/load-page-config.use-case';
import { ConfigRepository } from '../../../../../infrastructure/repositories/config.repository';
import { ComponentRegistry } from '../../../../../infrastructure/services/component-registry.service';
import { StyleBuilder } from '../../../../../infrastructure/services/style-builder.service';
import { HttpClientMock } from '../../../../../../../infrastructure/http/http-client.mock';
import { bindUIRenderer } from '../../../../../infrastructure/bootstrap/bind.ui-renderer';
import type { SpacingValue } from '../../../../../domain/types';

describe('Main Content Data Flow', () => {
  let container: Container;

  beforeEach(() => {
    // Create new container for each test
    container = new Container();
    
    // Mock HttpClient
    const httpClientMock = new HttpClientMock();
    container.bind(ROOT_TYPES.HttpClient).toConstantValue(httpClientMock);
    
    // Bind UI Renderer services using the proper binding function
    bindUIRenderer(container);
  });

  it('should load main-content config and render offers grid', async () => {
    const useCase = container.get<LoadPageConfigUseCase>(UI_RENDERER_TYPES.LoadPageConfigUseCase);
    
    // Execute use case
    const result = await useCase.execute({ pageType: 'main-content' });
    
    // Verify result
    expect(result.isSuccess()).toBe(true);
    
    if (result.isSuccess()) {
      const config = result.data;
      
      // Verify config structure
      expect(config.type).toBe('main-content');
      expect(config.version).toBe('1.0');
      expect(config.theme).toBeDefined();
      expect(config.layout).toBeDefined();
      
      // Verify layout structure
      expect(config.layout.type).toBe('Container');
      expect(config.layout.children).toBeDefined();
      expect(config.layout.children.length).toBe(2);
      
      // Verify first child is Text (page title)
      expect(config.layout.children[0].type).toBe('Text');
      expect(config.layout.children[0].props.text).toBe('Offers');
      
      // Verify second child is DataGrid
      expect(config.layout.children[1].type).toBe('DataGrid');
      expect(config.layout.children[1].props.dataSource).toBe('api://products/offers');
      expect(config.layout.children[1].props.columns).toBe(4);
      expect(config.layout.children[1].props.gap).toBe(4);
    }
  }, 10000);

  it('should handle missing main-content config gracefully', async () => {
    const useCase = container.get<LoadPageConfigUseCase>(UI_RENDERER_TYPES.LoadPageConfigUseCase);
    
    // Try to load non-existent config
    const result = await useCase.execute({ pageType: 'non-existent' });
    
    // Verify error handling
    expect(result.isFailure()).toBe(true);
    
    if (result.isFailure()) {
      expect(result.error.message).toContain('Failed to load');
    }
  }, 10000);

  it('should register all required components', () => {
    const registry = container.get<ComponentRegistry>(UI_RENDERER_TYPES.ComponentRegistry);
    
    // Verify all components are registered
    expect(registry.getComponent('Button')).toBeDefined();
    expect(registry.getComponent('Container')).toBeDefined();
    expect(registry.getComponent('Badge')).toBeDefined();
    expect(registry.getComponent('Image')).toBeDefined();
    expect(registry.getComponent('Text')).toBeDefined();
    expect(registry.getComponent('Grid')).toBeDefined();
    expect(registry.getComponent('DataGrid')).toBeDefined();
    expect(registry.getComponent('OfferCard')).toBeDefined();
  });

  it('should build styles correctly', () => {
    const styleBuilder = container.get<StyleBuilder>(UI_RENDERER_TYPES.StyleBuilder);
    
    const styles = {
      padding: 4 as SpacingValue,
      backgroundColor: 'background' as const,
      textColor: 'text' as const,
      fontSize: '4xl' as const,
      fontWeight: 'bold' as const,
      marginBottom: 8 as SpacingValue,
    };
    
    // Test className building
    const className = styleBuilder.buildClassName(styles);
    expect(className).toContain('p-4');
    // fontSize, fontWeight, marginBottom are handled as inline styles, not Tailwind classes
    
    // Test inline styles building
    const inlineStyles = styleBuilder.buildInlineStyles(styles);
    expect(inlineStyles).toHaveProperty('backgroundColor');
    expect(inlineStyles).toHaveProperty('color');
  });
});
