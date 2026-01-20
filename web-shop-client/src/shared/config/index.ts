

export type {
	AppConfig,
	GlobalTheme,
	ThemeColors,
	BorderRadius,
	Typography,
	FontSizeScale,
	FontWeightScale,
	GlobalBackground,
	SharedConfig,
	ModulesConfig,
	AuthenticationModuleConfig,
	AuthLabels,
	AuthSettings,
	LoginButtonUIConfig,
	ModuleSchema,
	FieldsSchema,
	FieldSchema,
	ComponentNodeData,
	AppConstants,
	ApiConstants,
	UIConstants,
	UILayoutConfig
} from './app-config.types';

export {
	validateModuleConfig,
	getDefaultConfig,
	mergeWithDefaults,
	getFieldDescription,
	getSectionFields
} from './config-validator';

export type { ValidationResult, ValidationError } from './config-validator';
