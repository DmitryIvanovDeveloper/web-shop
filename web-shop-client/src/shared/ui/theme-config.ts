

export interface ColorConfig {
	readonly primary: string;
	readonly secondary?: string;
	readonly accent?: string;
	readonly background: string;
	readonly surface: string;
	readonly text: string;
	readonly textSecondary?: string;
	readonly success?: string;
	readonly error?: string;
	readonly warning?: string;
	readonly border?: string;
}

export interface ThemeConfig {
	readonly colors: Readonly<ColorConfig>;
	readonly spacing: readonly number[];
	readonly typography?: Readonly<{
		readonly fontFamily?: string;
		readonly fontSize?: Record<string, string>;
		readonly fontWeight?: Record<string, number>;
	}>;
}


