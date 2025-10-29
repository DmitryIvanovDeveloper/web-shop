/**
 * App Config Types - типы для централизованного конфига приложения
 * Загружается при старте и распространяется через EventBus
 */

export interface AppConfig {
	readonly version: string;
	readonly environment: string;
	readonly theme: GlobalTheme;
	readonly background?: GlobalBackground;
	readonly shared?: SharedConfig;
	readonly modules: ModulesConfig;
	readonly constants: AppConstants;
}

export interface GlobalTheme {
	readonly colors: ThemeColors;
	readonly spacing: readonly number[];
	readonly borderRadius: BorderRadius;
	readonly typography: Typography;
}

export interface ThemeColors {
	readonly primary: string;
	readonly secondary: string;
	readonly accent: string;
	readonly background: string;
	readonly surface: string;
	readonly text: string;
	readonly textSecondary: string;
	readonly success: string;
	readonly error: string;
	readonly warning: string;
	readonly border: string;
}

export interface BorderRadius {
	readonly small: number;
	readonly medium: number;
	readonly large: number;
	readonly full: number;
}

export interface Typography {
	readonly fontFamily: string;
	readonly fontSize: FontSizeScale;
	readonly fontWeight: FontWeightScale;
}

export interface GlobalBackground {
	readonly backgroundImage?: string;
	readonly backgroundSize?: string;
	readonly backgroundPosition?: string;
	readonly backgroundRepeat?: string;
	readonly backgroundAttachment?: string;
	readonly backgroundColor?: string;
}

export interface SharedConfig {
	readonly offerCardUI?: OfferCardUIConfig;
	readonly productCardUI?: ProductCardUIConfig;
}

export interface OfferCardUIConfig {
	readonly container: CardContainerStyle;
	readonly image: CardImageStyle;
	readonly includedItems: IncludedItemsStyle;
	readonly title: CardTitleStyle;
	readonly rarity: RarityStyle;
	readonly buyButton: CardButtonStyle;
	readonly purchasedBadge: CardBadgeStyle;
	readonly bonuses: BonusesStyle;
}

export interface ProductCardUIConfig {
	readonly container: CardContainerStyle;
	readonly image: CardImageStyle;
	readonly title: CardTitleStyle;
	readonly buyButton: CardButtonStyle;
	readonly purchasedBadge: CardBadgeStyle;
}

export interface CardContainerStyle {
	readonly backgroundColor: string;
	readonly borderRadius: string;
	readonly shadow: string;
}

export interface CardImageStyle {
	readonly backgroundColor: string;
	readonly aspectRatio: string;
}

export interface IncludedItemsStyle {
	readonly backgroundColor: string;
	readonly itemBackgroundColor: string;
}

export interface CardTitleStyle {
	readonly fontSize: string;
	readonly fontWeight: string;
	readonly color: string;
}

export interface RarityStyle {
	readonly backgroundColor: string;
	readonly color: string;
}

export interface CardButtonStyle {
	readonly backgroundColor: string;
	readonly color: string;
	readonly borderRadius: string;
	readonly fontSize: string;
	readonly fontWeight: string;
	readonly padding: string;
	readonly minHeight: string;
}

export interface CardBadgeStyle {
	readonly backgroundColor: string;
	readonly color: string;
}

export interface BonusesStyle {
	readonly rpColor: string;
	readonly lpColor: string;
	readonly fontSize: string;
}

export interface FontSizeScale {
	readonly xs: string;
	readonly sm: string;
	readonly base: string;
	readonly lg: string;
	readonly xl: string;
	readonly '2xl': string;
	readonly '3xl': string;
	readonly '4xl': string;
}

export interface FontWeightScale {
	readonly normal: number;
	readonly medium: number;
	readonly semibold: number;
	readonly bold: number;
	readonly extrabold: number;
}

export interface ModulesConfig {
	readonly authentication: AuthenticationModuleConfig;
	readonly products: ProductsModuleConfig;
	readonly offers: OffersModuleConfig;
	readonly uiRenderer: UIRendererModuleConfig;
}

export interface AuthenticationModuleConfig {
	readonly labels: AuthLabels;
	readonly settings: AuthSettings;
	readonly loginButtonUI: LoginButtonUIConfig;
}

export interface AuthLabels {
	readonly loginButton: string;
	readonly logoutButton: string;
	readonly appIdPlaceholder: string;
	readonly userIdPlaceholder: string;
	readonly submitButton: string;
	readonly welcomeTitle: string;
	readonly welcomeMessage: string;
	readonly welcomeSubtitle: string;
	readonly enterAppId: string;
	readonly enterUserId: string;
	readonly successMessage: string;
	readonly loadingMessage: string;
	readonly errorMessage: string;
	readonly helpQuestion: string;
	readonly helpAnswer: string;
	readonly agreementText: string;
	readonly privacyPolicy: string;
	readonly termsOfService: string;
	readonly refundPolicy: string;
}

export interface AuthSettings {
	readonly closeDelay: number;
	readonly showHelpSection: boolean;
	readonly showAgreement: boolean;
	readonly rememberUser: boolean;
}

export interface LoginButtonUIConfig {
	readonly icon: string;
	readonly styles: Record<string, string | number>;
	readonly hoverStyles?: Record<string, string | number>;
}

export interface ProductsModuleConfig {
	readonly labels: ProductsLabels;
	readonly settings: ProductsSettings;
}

export interface ProductsLabels {
	readonly title: string;
	readonly buyButton: string;
	readonly purchasedBadge: string;
	readonly emptyState: string;
	readonly loadingState: string;
}

export interface ProductsSettings {
	readonly gridColumns: number;
	readonly gridGap: number;
	readonly enableFilters: boolean;
}

export interface OffersModuleConfig {
	readonly labels: OffersLabels;
	readonly settings: OffersSettings;
}

export interface OffersLabels {
	readonly title: string;
	readonly featuredTitle: string;
	readonly emptyState: string;
	readonly expiredBadge: string;
}

export interface OffersSettings {
	readonly featuredThreshold: number;
	readonly gridColumns: number;
	readonly gridGap: number;
}

export interface AppConstants {
	readonly api: ApiConstants;
	readonly ui: UIConstants;
}

export interface ApiConstants {
	readonly timeout: number;
	readonly retryAttempts: number;
}

export interface UIConstants {
	readonly animationDuration: number;
	readonly toastDuration: number;
	readonly mobileBreakpoint: number;
}

// UI Renderer Module Config
export interface UIRendererModuleConfig {
	readonly sidebar: UILayoutConfig;
	readonly rightSidebar: UILayoutConfig;
	readonly store: UILayoutConfig;
}

export interface UILayoutConfig {
	readonly version: string;
	readonly theme: UITheme;
	readonly layout: ComponentNodeData;
}

export interface UITheme {
	readonly colors: Record<string, string>;
	readonly spacing: readonly number[];
}

export interface ComponentNodeData {
	readonly id: string;
	readonly type: string;
	readonly props?: Record<string, any>;
	readonly styles?: Record<string, any>;
	readonly children?: readonly ComponentNodeData[];
	readonly actions?: Record<string, any>;
}



