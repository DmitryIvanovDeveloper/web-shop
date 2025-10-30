/**
 * Config Validator - утилиты для валидации и работы с модульными конфигами
 * Используется UI Builder для генерации форм и валидации
 */

import type { ModuleSchema, FieldSchema } from './app-config.types';

export interface ValidationResult {
	readonly valid: boolean;
	readonly errors: readonly ValidationError[];
}

export interface ValidationError {
	readonly field: string;
	readonly message: string;
	readonly value?: any;
}

/**
 * Валидирует конфиг модуля по схеме
 */
export function validateModuleConfig(
	moduleKey: string,
	config: Record<string, any>,
	schema: ModuleSchema
): ValidationResult {
	const errors: ValidationError[] = [];

	// Валидация labels
	if (schema.labels && config.labels) {
		const labelErrors = validateFields('labels', config.labels, schema.labels.fields);
		errors.push(...labelErrors);
	}

	// Валидация settings
	if (schema.settings && config.settings) {
		const settingErrors = validateFields('settings', config.settings, schema.settings.fields);
		errors.push(...settingErrors);
	}

	// Валидация UI components
	if (schema.ui && config.ui) {
		const uiErrors = validateFields('ui', config, schema.ui.fields);
		errors.push(...uiErrors);
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Валидирует поля по схеме
 */
function validateFields(
	section: string,
	data: Record<string, any>,
	fields: readonly FieldSchema[]
): ValidationError[] {
	const errors: ValidationError[] = [];

	for (const field of fields) {
		const value = data[field.key];

		// Проверка required
		if (field.required && (value === undefined || value === null)) {
			errors.push({
				field: `${section}.${field.key}`,
				message: `Field is required but missing`,
				value
			});
			continue;
		}

		// Пропускаем валидацию если значение отсутствует и не required
		if (value === undefined || value === null) {
			continue;
		}

		// Проверка типа
		const actualType = Array.isArray(value) ? 'array' : typeof value;
		if (field.type !== 'componentNode' && actualType !== field.type) {
			errors.push({
				field: `${section}.${field.key}`,
				message: `Expected type "${field.type}" but got "${actualType}"`,
				value
			});
			continue;
		}

		// Проверка min/max для чисел
		if (field.type === 'number' && typeof value === 'number') {
			if (field.min !== undefined && value < field.min) {
				errors.push({
					field: `${section}.${field.key}`,
					message: `Value ${value} is less than minimum ${field.min}`,
					value
				});
			}
			if (field.max !== undefined && value > field.max) {
				errors.push({
					field: `${section}.${field.key}`,
					message: `Value ${value} is greater than maximum ${field.max}`,
					value
				});
			}
		}

		// Проверка options для enum полей
		if (field.options && field.options.length > 0) {
			if (!field.options.includes(String(value))) {
				errors.push({
					field: `${section}.${field.key}`,
					message: `Value "${value}" is not in allowed options: ${field.options.join(', ')}`,
					value
				});
			}
		}
	}

	return errors;
}

/**
 * Генерирует дефолтный конфиг из схемы
 */
export function getDefaultConfig(schema: ModuleSchema): Record<string, any> {
	const config: Record<string, any> = {};

	// Генерируем labels
	if (schema.labels) {
		config.labels = {};
		for (const field of schema.labels.fields) {
			if (field.default !== undefined) {
				config.labels[field.key] = field.default;
			}
		}
	}

	// Генерируем settings
	if (schema.settings) {
		config.settings = {};
		for (const field of schema.settings.fields) {
			if (field.default !== undefined) {
				config.settings[field.key] = field.default;
			}
		}
	}

	// Генерируем UI
	if (schema.ui) {
		for (const field of schema.ui.fields) {
			if (field.default !== undefined) {
				config[field.key] = field.default;
			}
		}
	}

	return config;
}

/**
 * Объединяет конфиг с дефолтами из схемы
 * Заполняет отсутствующие поля дефолтными значениями
 */
export function mergeWithDefaults(
	config: Record<string, any>,
	schema: ModuleSchema
): Record<string, any> {
	const defaultConfig = getDefaultConfig(schema);
	
	return {
		labels: {
			...defaultConfig.labels,
			...config.labels
		},
		settings: {
			...defaultConfig.settings,
			...config.settings
		},
		...Object.keys(defaultConfig).reduce((acc, key) => {
			if (key !== 'labels' && key !== 'settings') {
				acc[key] = config[key] !== undefined ? config[key] : defaultConfig[key];
			}
			return acc;
		}, {} as Record<string, any>)
	};
}

/**
 * Получает описание поля из схемы (для UI Builder подсказок)
 */
export function getFieldDescription(
	schema: ModuleSchema,
	section: 'labels' | 'settings' | 'ui',
	fieldKey: string
): string | undefined {
	const fields = section === 'labels' 
		? schema.labels?.fields
		: section === 'settings'
			? schema.settings?.fields
			: schema.ui?.fields;

  const field = fields?.find((f: FieldSchema) => f.key === fieldKey);
	return field?.description;
}

/**
 * Получает все поля секции из схемы (для UI Builder генерации форм)
 */
export function getSectionFields(
	schema: ModuleSchema,
	section: 'labels' | 'settings' | 'ui'
): readonly FieldSchema[] {
	if (section === 'labels') {
		return schema.labels?.fields || [];
	}
	if (section === 'settings') {
		return schema.settings?.fields || [];
	}
	return schema.ui?.fields || [];
}






