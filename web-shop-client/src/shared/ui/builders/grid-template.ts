/**
 * Grid Template - готовые шаблоны для grid layouts
 * Упрощает создание популярных UI паттернов
 */

import type { ComponentNode } from '../component-node';
import { UIComponents } from '../component-types';

export class GridTemplate {
	public static createProductGrid(
		items: readonly ComponentNode[],
		columns: number = 4,
		gap: number = 16
	): ComponentNode {
		return {
			id: 'product-grid',
			type: UIComponents.Grid,
			props: {
				columns,
				gap
			},
			children: items
		};
	}

	public static createOfferGrid(
		items: readonly ComponentNode[],
		columns: number = 3,
		gap: number = 16
	): ComponentNode {
		return {
			id: 'offer-grid',
			type: UIComponents.Grid,
			props: {
				columns,
				gap
			},
			children: items
		};
	}

	public static createResponsiveGrid(
		items: readonly ComponentNode[],
		gap: number = 16
	): ComponentNode {
		return {
			id: 'responsive-grid',
			type: UIComponents.DataGrid,
			props: {
				columns: 4,
				gap
			},
			styles: {
				className: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
			},
			children: items
		};
	}
}


