import type { PageConfig } from '../../domain/value-objects/page-config.value-object';

export type SidebarViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly config: PageConfig }
  | { readonly status: 'error'; readonly error: string };


