import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Grid } from '../grid';

describe('Grid Component', () => {
  it('should render with default adaptive behavior', () => {
    const { container } = render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toBeDefined();
    expect(gridElement.tagName).toBe('DIV');
  });

  it('should render children correctly', () => {
    const { container } = render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');
  });

  it('should apply className correctly', () => {
    const { container } = render(
      <Grid className="test-class">
        <div>Item 1</div>
      </Grid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement.className).toContain('test-class');
  });

  it('should handle flex layout when className contains flex', () => {
    const { container } = render(
      <Grid className="flex flex-col">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement.className).toContain('flex');
    expect(gridElement.className).toContain('flex-col');
  });

  it('should work with adaptive=false prop', () => {
    const { container } = render(
      <Grid adaptive={false}>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    expect(container.firstChild).toBeDefined();
  });

  it('should work with custom minItemWidth', () => {
    const { container } = render(
      <Grid minItemWidth="200px">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    expect(container.firstChild).toBeDefined();
  });

  it('should handle empty children', () => {
    const { container } = render(<Grid />);

    expect(container.firstChild).toBeDefined();
  });
});
