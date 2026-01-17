# Merchant Admin – Products

Admin-side product catalog management.

## Architecture
- **Domain**: product entity, value objects, errors.
- **Application / use-cases**: load products, create/update/delete, manage storage links.
- **Ports**: product repository/storage ports.
- **Infrastructure**: HTTP/Supabase repositories under `infrastructure/repositories` and storage; DI bindings in `infrastructure/bootstrap`.
- **Interface adapters**: presenter + view-model, admin React views for listing/editing products.

## Data flow
1) UI invokes presenter → use case → repository (REST to `/api/merchant-admin/products` and related endpoints).
2) Repository maps DTO ⇄ domain and persists.
3) Presenter updates view-model for admin pages.

## Notes
- Make sure media/storage endpoints are configured when working with images.
- Errors from API propagate as failed results from use cases.

