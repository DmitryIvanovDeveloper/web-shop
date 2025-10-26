import { render, screen } from '@testing-library/react';
import { OfferCardSkeleton } from '../offer-card-skeleton';

describe('OfferCardSkeleton', () => {
  it('renders skeleton structure', () => {
    render(<OfferCardSkeleton />);
    
    // Check that the main container is rendered
    const container = screen.getByRole('generic');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('animate-pulse');
  });

  it('applies custom className', () => {
    const customClass = 'custom-skeleton-class';
    render(<OfferCardSkeleton className={customClass} />);
    
    const container = screen.getByRole('generic');
    expect(container).toHaveClass(customClass);
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<OfferCardSkeleton style={customStyle} />);
    
    const container = screen.getByRole('generic');
    expect(container).toHaveStyle('background-color: red');
  });

  it('renders all skeleton elements', () => {
    render(<OfferCardSkeleton />);
    
    // Check that skeleton elements are present (they should have gray-600 background)
    const skeletonElements = document.querySelectorAll('.bg-gray-600');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
