import type { AppConfig } from '../../domain/entities/app-config.entity';
import type { PageConfig } from '../../domain/entities/page-config.entity';
import { generateElementId } from './id-generator';

/**
 * Recursively migrates all element IDs in the config to UUID format
 * Replaces ALL existing IDs (including old formats) with new UUID-based IDs
 */
export function migrateConfigIds(config: AppConfig): AppConfig {
  if (!config || !config.config) {
    return config;
  }

  const migratedConfig = JSON.parse(JSON.stringify(config.config));
  
  /**
   * Recursively traverse and migrate IDs in any object structure
   */
  function migrateNode(node: any): void {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return;
    }

    // If node has a type, it's likely a component/element that needs an ID
    // Always replace existing ID with new UUID-based ID (even if it already exists)
    if (node.type && typeof node.type === 'string') {
      node.id = generateElementId(node.type.toLowerCase());
    }

    // Recursively process children arrays
    if (Array.isArray(node.children)) {
      node.children.forEach((child: any) => migrateNode(child));
    }

    // Recursively process components arrays (for page sections)
    if (Array.isArray(node.components)) {
      node.components.forEach((component: any) => migrateNode(component));
    }

    // Recursively process sections arrays (for page configs)
    if (Array.isArray(node.sections)) {
      node.sections.forEach((section: any) => migrateNode(section));
    }

    // Recursively process offerCards arrays
    if (Array.isArray(node.offerCards)) {
      node.offerCards.forEach((card: any) => {
        if (card && typeof card === 'object') {
          // Offer cards have id at root level
          if (card.id) {
            card.id = generateElementId('offer-card');
          }
          migrateNode(card);
        }
      });
    }

    // Recursively process all other object properties
    for (const key in node) {
      if (key !== 'id' && key !== 'children' && key !== 'components' && key !== 'sections' && key !== 'offerCards') {
        const value = node[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          migrateNode(value);
        } else if (Array.isArray(value)) {
          // Process arrays of objects
          value.forEach((item: any) => {
            if (item && typeof item === 'object') {
              migrateNode(item);
            }
          });
        }
      }
    }
  }

  // Start migration from root config
  migrateNode(migratedConfig);

  return {
    ...config,
    config: migratedConfig,
  };
}

/**
 * Migrates all element IDs in a PageConfig to UUID format
 * Replaces ALL existing IDs (including old formats) with new UUID-based IDs
 */
export function migratePageConfigIds(pageConfig: PageConfig): PageConfig {
  if (!pageConfig) {
    return pageConfig;
  }

  const migrated = JSON.parse(JSON.stringify(pageConfig));
  
  /**
   * Recursively traverse and migrate IDs in sections and components
   */
  function migrateNode(node: any): void {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return;
    }

    // If node has a type, it's likely a component/element that needs an ID
    // Always replace existing ID with new UUID-based ID (even if it already exists)
    if (node.type && typeof node.type === 'string') {
      node.id = generateElementId(node.type.toLowerCase());
    }

    // Recursively process components arrays (for page sections)
    if (Array.isArray(node.components)) {
      node.components.forEach((component: any) => migrateNode(component));
    }

    // Recursively process sections arrays
    if (Array.isArray(node.sections)) {
      node.sections.forEach((section: any) => migrateNode(section));
    }

    // Recursively process layout objects (sections may have layout)
    if (node.layout && typeof node.layout === 'object') {
      migrateNode(node.layout);
    }

    // Recursively process all other object properties
    for (const key in node) {
      if (key !== 'id' && key !== 'components' && key !== 'sections' && key !== 'layout') {
        const value = node[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          migrateNode(value);
        } else if (Array.isArray(value)) {
          // Process arrays of objects
          value.forEach((item: any) => {
            if (item && typeof item === 'object') {
              migrateNode(item);
            }
          });
        }
      }
    }
  }

  // Migrate all sections
  if (Array.isArray(migrated.sections)) {
    migrated.sections.forEach((section: any) => migrateNode(section));
  }

  return migrated;
}





