import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import { generateElementId } from './id-generator';

export function migrateConfigIds(config: AppConfig): AppConfig {
  if (!config || !config.config) {
    return config;
  }

  const migratedConfig = JSON.parse(JSON.stringify(config.config));

  function migrateNode(node: any): void {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return;
    }

    if (node.type && typeof node.type === 'string') {
      node.id = generateElementId(node.type.toLowerCase());
    }

    if (Array.isArray(node.children)) {
      node.children.forEach((child: any) => migrateNode(child));
    }

    if (Array.isArray(node.components)) {
      node.components.forEach((component: any) => migrateNode(component));
    }

    if (Array.isArray(node.sections)) {
      node.sections.forEach((section: any) => migrateNode(section));
    }

    if (Array.isArray(node.offerCards)) {
      node.offerCards.forEach((card: any) => {
        if (card && typeof card === 'object') {
          
          if (card.id) {
            card.id = generateElementId('offer-card');
          }
          migrateNode(card);
        }
      });
    }

    for (const key in node) {
      if (key !== 'id' && key !== 'children' && key !== 'components' && key !== 'sections' && key !== 'offerCards') {
        const value = node[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          migrateNode(value);
        } else if (Array.isArray(value)) {
          
          value.forEach((item: any) => {
            if (item && typeof item === 'object') {
              migrateNode(item);
            }
          });
        }
      }
    }
  }

  migrateNode(migratedConfig);

  return {
    ...config,
    config: migratedConfig,
  };
}

export function migratePageConfigIds(pageConfig: PageConfig): PageConfig {
  if (!pageConfig) {
    return pageConfig;
  }

  const migrated = JSON.parse(JSON.stringify(pageConfig));

  function migrateNode(node: any): void {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return;
    }

    if (node.type && typeof node.type === 'string') {
      node.id = generateElementId(node.type.toLowerCase());
    }

    if (Array.isArray(node.components)) {
      node.components.forEach((component: any) => migrateNode(component));
    }

    if (Array.isArray(node.sections)) {
      node.sections.forEach((section: any) => migrateNode(section));
    }

    if (node.layout && typeof node.layout === 'object') {
      migrateNode(node.layout);
    }

    for (const key in node) {
      if (key !== 'id' && key !== 'components' && key !== 'sections' && key !== 'layout') {
        const value = node[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          migrateNode(value);
        } else if (Array.isArray(value)) {
          
          value.forEach((item: any) => {
            if (item && typeof item === 'object') {
              migrateNode(item);
            }
          });
        }
      }
    }
  }

  if (Array.isArray(migrated.sections)) {
    migrated.sections.forEach((section: any) => migrateNode(section));
  }

  return migrated;
}

