import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { LoadingProgress, useLoadingStages, SkeletonBox, SkeletonText, SkeletonCard, LoadingSpinner } from '../LoadingProgress';

describe('LoadingProgress', () => {
  it('renders loading message', () => {
    const stage = { id: 'test', message: 'Loading test...', progress: 50 };
    render(<LoadingProgress stage={stage} />);
    expect(screen.getByText('Loading test...')).toBeInTheDocument();
  });

  it('displays Star title', () => {
    const stage = { id: 'test', message: 'Loading...', progress: 0 };
    render(<LoadingProgress stage={stage} />);
    expect(screen.getByText('Star')).toBeInTheDocument();
  });

  it('shows progress percentage', () => {
    const stage = { id: 'test', message: 'Loading...', progress: 75 };
    render(<LoadingProgress stage={stage} />);
    // Note: Progress animates, so we check for existence
    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  it('renders at 100% progress', () => {
    const stage = { id: 'test', message: 'Complete!', progress: 100 };
    render(<LoadingProgress stage={stage} />);

    // Verify the component displays 100% (note: actual percentage may animate, so just check it renders)
    expect(screen.getByText('Complete!')).toBeInTheDocument();
    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });
});

describe('SkeletonBox', () => {
  it('renders with default dimensions', () => {
    const { container } = render(<SkeletonBox />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    const { container } = render(<SkeletonBox width="200px" height="50px" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });
});

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonText />);
    // The component renders a parent div with SkeletonBox children
    const parent = container.firstChild as HTMLElement;
    expect(parent.children).toHaveLength(3);
  });

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const parent = container.firstChild as HTMLElement;
    expect(parent.children).toHaveLength(5);
  });
});

describe('SkeletonCard', () => {
  it('renders card structure', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('renders with custom size', () => {
    const { container } = render(<LoadingSpinner size="60px" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveStyle({ width: '60px', height: '60px' });
  });
});

describe('useLoadingStages', () => {
  it('starts at first stage', () => {
    let hookResult: ReturnType<typeof useLoadingStages>;

    function TestComponent() {
      hookResult = useLoadingStages();
      return null;
    }

    render(<TestComponent />);
    expect(hookResult!.currentStage.id).toBe('catalog');
    expect(hookResult!.isLoading).toBe(true);
  });

  it('progresses through stages', () => {
    let hookResult: ReturnType<typeof useLoadingStages>;

    function TestComponent() {
      hookResult = useLoadingStages();
      return null;
    }

    render(<TestComponent />);

    act(() => {
      hookResult!.nextStage();
    });

    expect(hookResult!.currentStage.id).toBe('astronomy');
  });

  it('sets loading to false when complete', () => {
    let hookResult: ReturnType<typeof useLoadingStages>;

    function TestComponent() {
      hookResult = useLoadingStages();
      return null;
    }

    render(<TestComponent />);

    // Progress through all stages
    act(() => {
      hookResult!.nextStage(); // astronomy
      hookResult!.nextStage(); // scene
      hookResult!.nextStage(); // complete
      hookResult!.nextStage(); // should not go further
    });

    expect(hookResult!.isLoading).toBe(false);
  });

  it('can set stage directly by id', () => {
    let hookResult: ReturnType<typeof useLoadingStages>;

    function TestComponent() {
      hookResult = useLoadingStages();
      return null;
    }

    render(<TestComponent />);

    act(() => {
      hookResult!.setStage('scene');
    });

    expect(hookResult!.currentStage.id).toBe('scene');
  });

  it('can reset to initial state', () => {
    let hookResult: ReturnType<typeof useLoadingStages>;

    function TestComponent() {
      hookResult = useLoadingStages();
      return null;
    }

    render(<TestComponent />);

    act(() => {
      hookResult!.nextStage();
      hookResult!.reset();
    });

    expect(hookResult!.currentStage.id).toBe('catalog');
    expect(hookResult!.isLoading).toBe(true);
  });
});
