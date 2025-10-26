# Molecules Components

## OfferCardSkeleton

Skeleton loading component that mimics the structure of `OfferCard` while data is loading.

### Usage

```tsx
import { OfferCardSkeleton } from '@/shared/components/molecules/offer-card-skeleton';

// Basic usage
<OfferCardSkeleton />

// With custom styling
<OfferCardSkeleton 
  className="custom-class"
  style={{ backgroundColor: 'red' }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `CSSProperties` | `undefined` | Inline styles |

### Features

- **Animated**: Uses `animate-pulse` class for smooth loading animation
- **Responsive**: Uses container queries (`cqw`) for proportional sizing
- **Consistent**: Matches the exact structure of `OfferCard`
- **Accessible**: Maintains proper semantic structure

### Structure

The skeleton includes:
- Badge placeholders (discount, timer, player limit)
- Main image placeholder
- Included items section placeholder
- Title and rarity placeholders
- Buy button placeholder
- RP/LP bonuses placeholders

### Integration Examples

#### Products List Loading State
```tsx
if (viewModel.status === 'loading') {
  return (
    <Grid>
      {Array.from({ length: 6 }, (_, index) => (
        <OfferCardSkeleton key={`skeleton-${index}`} />
      ))}
    </Grid>
  );
}
```

#### Offers List Loading State
```tsx
if (loading) {
  return (
    <Grid>
      {Array.from({ length: 3 }, (_, index) => (
        <OfferCardSkeleton key={`skeleton-${index}`} />
      ))}
    </Grid>
  );
}
```

### Styling

The skeleton uses Tailwind classes:
- `bg-gray-600` for skeleton elements
- `animate-pulse` for loading animation
- `rounded` for rounded corners
- Container queries for responsive sizing

### Best Practices

1. **Quantity**: Show 3-6 skeleton cards depending on expected content
2. **Duration**: Keep loading states brief (< 2 seconds)
3. **Consistency**: Use the same number of skeletons as expected content
4. **Accessibility**: Ensure skeleton structure matches final content
