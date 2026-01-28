import type { GrapeJsAppConfig } from '../config/grapejs-app-config.types';
import type { AppConfig, GlobalTheme, ThemeColors, OfferCardTemplate } from '../config/app-config.types';

/**
 * Адаптер для преобразования GrapeJS данных в устаревший формат AppConfig
 * для совместимости с существующими компонентами
 */
export class GrapeJsToLegacyAdapter {
  /**
   * Преобразует GrapeJS конфиг в AppConfig
   */
  static convert(grapeJsConfig: GrapeJsAppConfig): AppConfig {
    console.log('[GrapeJsToLegacyAdapter] ========== START Converting GrapeJS config ==========', {
      pagesCount: grapeJsConfig.pages?.length || 0,
      stylesCount: grapeJsConfig.styles?.length || 0,
      assetsCount: grapeJsConfig.assets?.length || 0,
      symbolsCount: grapeJsConfig.symbols?.length || 0
    });


    try {
      // Создаем минимальный валидный конфиг
      const result: AppConfig = {
        version: '1.0',
        environment: 'production',
        theme: this.extractTheme(grapeJsConfig),
        modules: {
          products: {
            labels: {
              title: 'Products',
              buyButton: 'Buy',
              purchasedBadge: 'Purchased',
              emptyState: 'No products available',
              loadingState: 'Loading...'
            },
            settings: {
              gridColumns: 3,
              gridGap: 16,
              enableFilters: true
            }
          },
          offers: {
            labels: {
              title: 'Offers',
              featuredTitle: 'Featured Offers',
              emptyState: 'No offers available',
              expiredBadge: 'Expired'
            },
            settings: {
              featuredThreshold: 100,
              gridColumns: 2,
              gridGap: 16
            }
          },
          authentication: {
            labels: {
              loginButton: 'Login',
              logoutButton: 'Logout',
              appIdPlaceholder: 'Enter App ID',
              userIdPlaceholder: 'Enter User ID',
              submitButton: 'Submit',
              welcomeTitle: 'Welcome',
              welcomeMessage: 'Please enter your credentials',
              welcomeSubtitle: 'Access your personalized experience',
              enterAppId: 'App ID',
              enterUserId: 'User ID',
              successMessage: 'Login successful!',
              loadingMessage: 'Logging in...',
              errorMessage: 'Login failed',
              helpQuestion: 'Need help?',
              helpAnswer: 'Contact support',
              agreementText: 'I agree to the terms',
              privacyPolicy: 'Privacy Policy',
              termsOfService: 'Terms of Service',
              refundPolicy: 'Refund Policy'
            },
            settings: {
              closeDelay: 3000,
              showHelpSection: true,
              showAgreement: true,
              rememberUser: false
            },
            loginButtonUI: {}
          },
          uiRenderer: {
            store: {
              theme: {
                colors: {
                  primary: '#3B5AFE',
                  secondary: '#FBBF24',
                  accent: '#FF6B35',
                  background: '#0D1117',
                  surface: '#161B22',
                  text: '#FFFFFF',
                  textSecondary: '#A0A0A0',
                  success: '#10B981',
                  error: '#EF4444',
                  warning: '#FFA500',
                  border: '#374151'
                },
                spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
              },
              layout: grapeJsConfig.pages?.[0]?.frames?.[0]?.component || {},
              version: '1.0'
            },
            sidebar: {
              theme: {
                colors: {
                  primary: '#3B5AFE',
                  secondary: '#FBBF24',
                  accent: '#FF6B35',
                  background: '#0D1117',
                  surface: '#161B22',
                  text: '#FFFFFF',
                  textSecondary: '#A0A0A0',
                  success: '#10B981',
                  error: '#EF4444',
                  warning: '#FFA500',
                  border: '#374151'
                },
                spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
              },
              layout: {},
              version: '1.0'
            },
            rightSidebar: {
              theme: {
                colors: {
                  primary: '#3B5AFE',
                  secondary: '#FBBF24',
                  accent: '#FF6B35',
                  background: '#0D1117',
                  surface: '#161B22',
                  text: '#FFFFFF',
                  textSecondary: '#A0A0A0',
                  success: '#10B981',
                  error: '#EF4444',
                  warning: '#FFA500',
                  border: '#374151'
                },
                spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
              },
              layout: {},
              version: '1.0'
            }
          }
        }
      };

      console.log('[GrapeJsToLegacyAdapter] Conversion completed successfully', {
        hasTheme: !!result.theme,
        hasModules: !!result.modules,
        modulesKeys: result.modules ? Object.keys(result.modules) : [],
        themeColors: result.theme?.colors
      });

      return result;
    } catch (error) {
      console.error('[GrapeJsToLegacyAdapter] Error during conversion, returning minimal config', error);

      if (typeof window !== 'undefined') {
        alert('GrapeJS Adapter ERROR: ' + error.message);
      }

      // Возвращаем минимальный валидный конфиг в случае ошибки
      return {
        version: '1.0',
        environment: 'production',
        theme: {
          colors: {
            primary: '#3B5AFE',
            secondary: '#FBBF24',
            accent: '#FF6B35',
            background: '#0D1117',
            surface: '#161B22',
            text: '#FFFFFF',
            textSecondary: '#A0A0A0',
            success: '#10B981',
            error: '#EF4444',
            warning: '#FFA500',
            border: '#374151'
          },
          spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
          borderRadius: { small: 4, medium: 8, large: 12, full: 9999 },
          typography: {
            fontFamily: 'Inter, sans-serif',
            fontSize: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem',
              '4xl': '2.25rem'
            },
            fontWeight: {
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700,
              extrabold: 800
            }
          }
        },
        modules: {
          products: {
            labels: {
              title: 'Products',
              buyButton: 'Buy',
              purchasedBadge: 'Purchased',
              emptyState: 'No products available',
              loadingState: 'Loading...'
            },
            settings: {
              gridColumns: 3,
              gridGap: 16,
              enableFilters: true
            }
          },
          offers: {
            labels: {
              title: 'Offers',
              featuredTitle: 'Featured Offers',
              emptyState: 'No offers available',
              expiredBadge: 'Expired'
            },
            settings: {
              featuredThreshold: 100,
              gridColumns: 2,
              gridGap: 16
            }
          },
          authentication: {
            labels: {
              loginButton: 'Login',
              logoutButton: 'Logout',
              appIdPlaceholder: 'Enter App ID',
              userIdPlaceholder: 'Enter User ID',
              submitButton: 'Submit',
              welcomeTitle: 'Welcome',
              welcomeMessage: 'Please enter your credentials',
              welcomeSubtitle: 'Access your personalized experience',
              enterAppId: 'App ID',
              enterUserId: 'User ID',
              successMessage: 'Login successful!',
              loadingMessage: 'Logging in...',
              errorMessage: 'Login failed',
              helpQuestion: 'Need help?',
              helpAnswer: 'Contact support',
              agreementText: 'I agree to the terms',
              privacyPolicy: 'Privacy Policy',
              termsOfService: 'Terms of Service',
              refundPolicy: 'Refund Policy'
            },
            settings: {
              closeDelay: 3000,
              showHelpSection: true,
              showAgreement: true,
              rememberUser: false
            },
            loginButtonUI: {}
          },
          uiRenderer: {
            store: {
              theme: {
                colors: {
                  primary: '#3B5AFE',
                  secondary: '#FBBF24',
                  accent: '#FF6B35',
                  background: '#0D1117',
                  surface: '#161B22',
                  text: '#FFFFFF',
                  textSecondary: '#A0A0A0',
                  success: '#10B981',
                  error: '#EF4444',
                  warning: '#FFA500',
                  border: '#374151'
                },
                spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
              },
              layout: {},
              version: '1.0'
            },
            sidebar: {
              theme: {
                colors: {
                  primary: '#3B5AFE',
                  secondary: '#FBBF24',
                  accent: '#FF6B35',
                  background: '#0D1117',
                  surface: '#161B22',
                  text: '#FFFFFF',
                  textSecondary: '#A0A0A0',
                  success: '#10B981',
                  error: '#EF4444',
                  warning: '#FFA500',
                  border: '#374151'
                },
                spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
              },
              layout: {},
              version: '1.0'
            },
            rightSidebar: {
              theme: {
                colors: {
                  primary: '#3B5AFE',
                  secondary: '#FBBF24',
                  accent: '#FF6B35',
                  background: '#0D1117',
                  surface: '#161B22',
                  text: '#FFFFFF',
                  textSecondary: '#A0A0A0',
                  success: '#10B981',
                  error: '#EF4444',
                  warning: '#FFA500',
                  border: '#374151'
                },
                spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
              },
              layout: {},
              version: '1.0'
            }
          }
        }
      };
    }
  }

  /**
   * Извлекает тему из GrapeJS стилей
   */
  private static extractTheme(config: GrapeJsAppConfig): GlobalTheme {
    console.log('[GrapeJsToLegacyAdapter] extractTheme called', { stylesCount: config.styles?.length });

    // Extract colors from specific selectors
    const themeColors = this.extractColorsFromSelectors(config.styles);

    // Extract CSS variables (legacy support)
    const cssVars = this.extractCssVariables(config.styles);
    console.log('[GrapeJsToLegacyAdapter] extracted CSS vars', { cssVarsCount: Object.keys(cssVars).length });

    // Merge extracted colors with CSS vars
    const cssVarColors = this.mapCssVarsToThemeColors(cssVars);
    const finalColors = { ...cssVarColors, ...themeColors };
    console.log('[GrapeJsToLegacyAdapter] CSS var colors:', cssVarColors);
    console.log('[GrapeJsToLegacyAdapter] selector colors:', themeColors);
    console.log('[GrapeJsToLegacyAdapter] final theme colors:', finalColors);

    return {
      colors: finalColors,
      spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
      borderRadius: { small: 4, medium: 8, large: 12, full: 9999 },
      typography: {
        fontFamily: cssVars['--font-family'] || 'Inter, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800
        }
      },
      background: this.extractGlobalBackground(config.styles)
    };
  }

  /**
   * Извлекает CSS переменные из стилей
   */
  private static extractCssVariables(styles: GrapeJsAppConfig['styles']): Record<string, string> {
    const cssVars: Record<string, string> = {};

    console.log('[GrapeJsToLegacyAdapter] Processing styles for CSS vars and properties:', styles?.length || 0);

    styles.forEach((style, index) => {
      if (style.style) {
        Object.entries(style.style).forEach(([key, value]) => {
          // Extract CSS variables (legacy)
          if (key.startsWith('--')) {
            cssVars[key] = String(value);
          }
          // Extract common CSS properties for theming
          else if (this._isThemeRelevantProperty(key)) {
            const varName = `--extracted-${key.replace(/-/g, '-')}`;
            cssVars[varName] = String(value);
          }
        });
      }
    });

    console.log('[GrapeJsToLegacyAdapter] Final extracted properties:', cssVars);
    return cssVars;
  }

  private static _isThemeRelevantProperty(property: string): boolean {
    const themeProperties = [
      'background-color',
      'color',
      'background',
      'border-color',
      'fill',
      'stroke'
    ];
    return themeProperties.includes(property);
  }

  private static extractColorsFromSelectors(styles: GrapeJsAppConfig['styles']): Partial<ThemeColors> {
    const colors: Partial<ThemeColors> = {};

    console.log('[GrapeJsToLegacyAdapter] Extracting colors from selectors');

    if (!styles || !Array.isArray(styles)) {
      console.log('[GrapeJsToLegacyAdapter] No styles array provided');
      return colors;
    }

    styles.forEach((style, index) => {
      if (!style || !style.style) {
        console.log(`[GrapeJsToLegacyAdapter] Style ${index} has no style object`);
        return;
      }

      const selectors = [
        ...(style.selectors || []),
        ...(style.selectorsAdd ? [style.selectorsAdd] : [])
      ];

      if (selectors.length === 0) {
        console.log(`[GrapeJsToLegacyAdapter] Style ${index} has no selectors`);
        return;
      }

      selectors.forEach((selector) => {
        if (!selector || typeof selector !== 'string') {
          console.log(`[GrapeJsToLegacyAdapter] Invalid selector: ${selector}`);
          return;
        }

        console.log(`[GrapeJsToLegacyAdapter] Processing selector: ${selector}`);

        try {
        // Extract colors based on selector patterns
        if (selector === 'body' || selector.includes('body')) {
          if (style.style['background-color']) {
            colors.background = String(style.style['background-color']);
            console.log(`[GrapeJsToLegacyAdapter] Found background color: ${colors.background}`);
          }
          if (style.style['color']) {
            colors.text = String(style.style['color']);
            console.log(`[GrapeJsToLegacyAdapter] Found text color: ${colors.text}`);
          }
        }

        // Sidebar colors
        if (selector.includes('sidebar') || selector.includes('column-left') || selector.includes('.sidebar')) {
          if (style.style['background-color']) {
            colors.surface = String(style.style['background-color']);
            console.log(`[GrapeJsToLegacyAdapter] Found sidebar background: ${colors.surface}`);
          }
        }

        // Button colors
        if (selector.includes('button') || selector.includes('.button')) {
          if (style.style['background-color']) {
            colors.primary = String(style.style['background-color']);
            console.log(`[GrapeJsToLegacyAdapter] Found button background: ${colors.primary}`);
          }
          if (style.style['color']) {
            colors.text = String(style.style['color']);
            console.log(`[GrapeJsToLegacyAdapter] Found button text color: ${colors.text}`);
          }
        }

        // General background colors for surfaces
        if (selector.includes('bg-') || selector.includes('background')) {
          if (style.style['background-color']) {
            // Use as surface color if not already set
            if (!colors.surface) {
              colors.surface = String(style.style['background-color']);
              console.log(`[GrapeJsToLegacyAdapter] Found surface background: ${colors.surface}`);
            }
          }
        }

        // Extract colors from CSS variables in :root
        if (selector === ':root, :host') {
          Object.entries(style.style).forEach(([prop, value]) => {
            if (prop.startsWith('--tkn-color-sem-bg-bg-base-primary')) {
              colors.background = String(value);
              colors.surface = String(value);
              console.log(`[GrapeJsToLegacyAdapter] Found theme background from CSS var: ${colors.background}`);
            }
            if (prop.startsWith('--tkn-color-sem-text-tx-primary')) {
              colors.text = String(value);
              console.log(`[GrapeJsToLegacyAdapter] Found theme text color from CSS var: ${colors.text}`);
            }
            if (prop.startsWith('--tkn-color-sem-text-tx-secondary')) {
              colors.textSecondary = String(value);
              console.log(`[GrapeJsToLegacyAdapter] Found theme secondary text color from CSS var: ${colors.textSecondary}`);
            }
          });
        }
        } catch (error) {
          console.error(`[GrapeJsToLegacyAdapter] Error processing selector ${selector}:`, error);
        }
      });
    });

    console.log('[GrapeJsToLegacyAdapter] Extracted colors from selectors:', colors);
    return colors;
  }

  /**
   * Преобразует CSS переменные в ThemeColors
   */
  private static mapCssVarsToThemeColors(cssVars: Record<string, string>): ThemeColors {
    // Try to extract colors from various CSS variable naming conventions
    return {
      primary: cssVars['--color-primary'] ||
               cssVars['--tkn-color-sem-bg-bg-base-primary'] ||
               '#3B5AFE',
      secondary: cssVars['--color-secondary'] ||
                 cssVars['--tkn-color-sem-text-tx-secondary'] ||
                 '#FBBF24',
      accent: cssVars['--color-accent'] || '#FF6B35',
      background: cssVars['--color-background'] ||
                  cssVars['--tkn-color-sem-bg-bg-base-primary'] ||
                  '#0D1117',
      surface: cssVars['--color-surface'] ||
               cssVars['--tkn-color-sem-bg-bg-base-primary'] ||
               '#161B22',
      text: cssVars['--color-text'] ||
            cssVars['--tkn-color-sem-text-tx-primary'] ||
            '#FFFFFF',
      textSecondary: cssVars['--color-text-secondary'] ||
                     cssVars['--tkn-color-sem-text-tx-secondary'] ||
                     '#A0A0A0',
      success: cssVars['--color-success'] || '#10B981',
      error: cssVars['--color-error'] || '#EF4444',
      warning: cssVars['--color-warning'] || '#FFA500',
      border: cssVars['--color-border'] ||
              cssVars['--tkn-color-sem-border-br-img'] ||
              '#374151'
    };
  }

  /**
   * Извлекает глобальный background из стилей
   */
  private static extractGlobalBackground(styles: GrapeJsAppConfig['styles']) {
    const bodyStyle = styles.find(style =>
      style.selectorsAdd === 'body' ||
      style.selectors.includes('body') ||
      style.selectorsAdd?.includes('body')
    );

    if (bodyStyle?.style) {
      return {
        backgroundColor: bodyStyle.style['background-color'] || bodyStyle.style.backgroundColor,
        backgroundImage: bodyStyle.style['background-image'] || bodyStyle.style.backgroundImage,
        backgroundSize: bodyStyle.style['background-size'] || bodyStyle.style.backgroundSize,
        backgroundPosition: bodyStyle.style['background-position'] || bodyStyle.style.backgroundPosition,
        backgroundRepeat: bodyStyle.style['background-repeat'] || bodyStyle.style.backgroundRepeat,
        backgroundAttachment: bodyStyle.style['background-attachment'] || bodyStyle.style.backgroundAttachment
      };
    }

    return undefined;
  }

  /**
   * Извлекает продукты модуль
   */
  private static extractProductsModule() {
    return {
      labels: {
        title: 'Products',
        buyButton: 'Buy',
        purchasedBadge: 'Purchased',
        emptyState: 'No products available',
        loadingState: 'Loading...'
      },
      settings: {
        gridColumns: 3,
        gridGap: 16,
        enableFilters: true
      }
    };
  }

  /**
   * Извлекает офферы модуль из GrapeJS данных
   */
  private static extractOffersModule(config: GrapeJsAppConfig) {
    // Ищем символы которые могут быть offer cards
    const offerSymbols = config.symbols.filter(symbol =>
      symbol.name?.toLowerCase().includes('offer') ||
      symbol.name?.toLowerCase().includes('card')
    );

    return {
      labels: {
        title: 'Offers',
        featuredTitle: 'Featured Offers',
        emptyState: 'No offers available',
        expiredBadge: 'Expired'
      },
      settings: {
        featuredThreshold: 100,
        gridColumns: 2,
        gridGap: 16
      }
    };
  }

  /**
   * Извлекает аутентификацию модуль
   */
  private static extractAuthenticationModule() {
    return {
      labels: {
        loginButton: 'Login',
        logoutButton: 'Logout',
        appIdPlaceholder: 'Enter App ID',
        userIdPlaceholder: 'Enter User ID',
        submitButton: 'Submit',
        welcomeTitle: 'Welcome',
        welcomeMessage: 'Please enter your credentials',
        welcomeSubtitle: 'Access your personalized experience',
        enterAppId: 'App ID',
        enterUserId: 'User ID',
        successMessage: 'Login successful!',
        loadingMessage: 'Logging in...',
        errorMessage: 'Login failed',
        helpQuestion: 'Need help?',
        helpAnswer: 'Contact support',
        agreementText: 'I agree to the terms',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        refundPolicy: 'Refund Policy'
      },
      settings: {
        closeDelay: 3000,
        showHelpSection: true,
        showAgreement: true,
        rememberUser: false
      },
      loginButtonUI: {}
    };
  }

  /**
   * Извлекает UI рендерер модуль из GrapeJS данных
   */
  private static extractUIRendererModule(config: GrapeJsAppConfig) {
    const pages = config.pages.map(page => ({
      id: page.id,
      type: page.type,
      components: page.frames.map(frame => frame.component)
    }));

    return {
      store: {
        theme: this.extractTheme(config),
        layout: pages[0]?.components[0] || {},
        version: '1.0'
      },
      sidebar: {
        theme: this.extractTheme(config),
        layout: {},
        version: '1.0'
      },
      rightSidebar: {
        theme: this.extractTheme(config),
        layout: {},
        version: '1.0'
      }
    };
  }

  /**
   * Извлекает offer cards из GrapeJS символов
   */
  static extractOfferCards(config: GrapeJsAppConfig): OfferCardTemplate[] {
    // Поиск символов которые являются offer cards
    return config.symbols
      .filter(symbol => symbol.name?.toLowerCase().includes('offer'))
      .map(symbol => ({
        id: symbol.id,
        name: symbol.name || 'Offer Card',
        styles: this.extractCardStyles(symbol.component),
        media: {
          mainImage: this.extractImageFromComponent(symbol.component),
          mainImageAlt: 'Offer card image'
        }
      }));
  }

  /**
   * Извлекает стили карточки из компонента
   */
  private static extractCardStyles(component: any) {
    // Рекурсивно обходим компонент и собираем стили
    const styles: any = {};

    if (component?.attributes?.style) {
      Object.assign(styles, component.attributes.style);
    }

    if (component?.children) {
      component.children.forEach((child: any) => {
        Object.assign(styles, this.extractCardStyles(child));
      });
    }

    return styles;
  }

  /**
   * Извлекает изображение из компонента
   */
  private static extractImageFromComponent(component: any): string | undefined {
    if (component?.type === 'img' && component?.attributes?.src) {
      return component.attributes.src;
    }

    if (component?.children) {
      for (const child of component.children) {
        const image = this.extractImageFromComponent(child);
        if (image) return image;
      }
    }

    return undefined;
  }
}