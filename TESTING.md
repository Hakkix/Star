# Testing Strategy - Star AR Project

## Overview

This document outlines the comprehensive testing strategy for the Star AR project. Given the unique nature of this application (AR, device sensors, real-time astronomy calculations, 3D rendering), our testing approach must cover multiple layers from pure functions to hardware API interactions.

## Testing Philosophy

**Quality Gates:**
- ✅ All tests must pass before merge
- ✅ Code coverage minimum: 80% overall, 90% for critical paths
- ✅ No console errors or warnings in production builds
- ✅ TypeScript strict mode with zero errors
- ✅ All PRs require passing CI/CD checks

**Test Pyramid:**
```
        /\
       /E2E\         10% - Critical user flows
      /______\
     /        \
    /Integration\   20% - Component interactions, hooks with context
   /____________\
  /              \
 /   Unit Tests   \ 70% - Pure functions, utilities, isolated components
/__________________\
```

## Tech Stack

**Test Framework:** Vitest
- Faster than Jest (ESM-native, Vite-powered)
- Better TypeScript support
- Compatible with Jest API (easy migration if needed)
- Built-in coverage with c8

**Component Testing:** React Testing Library
- User-centric testing approach
- Works with React Three Fiber components
- Accessibility-first queries

**E2E Testing:** Playwright
- Cross-browser support (Chrome, Firefox, Safari)
- Mobile device emulation
- Sensor API mocking capabilities

**Mocking:**
- Vitest built-in mocks for modules
- MSW (Mock Service Worker) if external APIs added
- Custom mocks for Three.js, device sensors

## Test Categories

### 1. Unit Tests (70% of test suite)

**Target:** Pure functions, utilities, calculations

**Coverage:**
- ✅ `lib/astronomy.ts` - All coordinate conversion functions
- ✅ `lib/store.ts` - Zustand state management logic
- ✅ Math utilities (LST calculation, RA/Dec to Cartesian)
- ✅ Data transformations (star catalog parsing)

**Example Test Files:**
```
src/lib/__tests__/astronomy.test.ts
src/lib/__tests__/store.test.ts
src/lib/__tests__/coordinates.test.ts
```

**Coverage Goals:**
- 90%+ for all lib/ functions
- 100% for critical astronomy calculations
- Edge cases: negative coordinates, pole positions, date boundaries

### 2. Hook Tests (20% of test suite)

**Target:** Custom React hooks with side effects

**Coverage:**
- ✅ `useDeviceOrientation.ts` - Permission flow, sensor data parsing
- ✅ `useGPS.ts` - Geolocation API, error handling, permission denied
- ✅ Hook integration with Zustand store

**Test Approach:**
```typescript
// Mock browser APIs
beforeEach(() => {
  vi.stubGlobal('navigator', {
    geolocation: { getCurrentPosition: vi.fn() }
  });
});

// Test hook with renderHook from @testing-library/react
const { result } = renderHook(() => useGPS());
```

**Critical Scenarios:**
- ✅ Permission granted → data received
- ✅ Permission denied → error state
- ✅ Unsupported browser → fallback behavior
- ✅ iOS 13+ permission flow (DeviceOrientationEvent.requestPermission)
- ✅ Sensor data updates trigger re-renders

### 3. Component Tests (DOM) (20% of test suite)

**Target:** React UI components (non-3D)

**Coverage:**
- ✅ `components/dom/Overlay.tsx` - Permission prompts, status messages
- ✅ `components/dom/DetailOverlay.tsx` - Info card rendering, Zustand subscription
- ✅ `components/dom/Loader.tsx` - Loading states

**Test Approach:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('Overlay shows permission button on iOS', () => {
  render(<Overlay />);
  expect(screen.getByText(/enable device orientation/i)).toBeInTheDocument();
});

test('DetailOverlay displays star data from store', () => {
  // Mock Zustand store
  useStore.setState({ selectedBody: mockStarData });
  render(<DetailOverlay />);
  expect(screen.getByText('Betelgeuse')).toBeInTheDocument();
});
```

**Accessibility Tests:**
- ✅ Semantic HTML (headings, buttons, regions)
- ✅ Keyboard navigation
- ✅ ARIA labels for dynamic content

### 4. Component Tests (Canvas/3D) (10% of test suite)

**Target:** React Three Fiber components

**Challenge:** Three.js renders to WebGL canvas, not DOM

**Approach:**
```typescript
// Option 1: Test logic, not rendering
test('StarField calculates correct instance count', () => {
  const stars = loadStarData();
  expect(stars.length).toBe(5000);
  // Test matrix calculations in isolation
});

// Option 2: Snapshot testing of R3F JSX structure
test('CelestialSphere renders with correct rotation group', () => {
  const { container } = render(
    <Canvas>
      <CelestialSphere />
    </Canvas>
  );
  // R3F renders to <canvas>, verify it exists
  expect(container.querySelector('canvas')).toBeInTheDocument();
});

// Option 3: Mock Three.js and test prop flow
vi.mock('three', () => ({
  Mesh: vi.fn(),
  Vector3: vi.fn(),
  // ... etc
}));
```

**Coverage:**
- ✅ Component mounting without errors
- ✅ Prop transformations (RA/Dec → positions)
- ✅ useFrame effects (e.g., planet position updates)
- ✅ Click handlers and raycasting logic

**Note:** Full 3D visual testing deferred to E2E layer.

### 5. Integration Tests (10% of test suite)

**Target:** Multiple components/hooks working together

**Scenarios:**
- ✅ GPS hook → CelestialSphere rotation (LST calculation)
- ✅ Device orientation → CameraController → camera quaternion
- ✅ Click on star → Zustand store update → DetailOverlay renders
- ✅ Permission flow → sensors enabled → scene updates

**Example:**
```typescript
test('complete interaction flow: GPS + sensors + click', async () => {
  // Mock GPS
  mockGeolocation({ latitude: 40, longitude: -74 });

  // Mock orientation
  mockDeviceOrientation({ alpha: 0, beta: 45, gamma: 0 });

  // Render full app
  render(<App />);

  // Wait for scene to load
  await waitFor(() => screen.getByTestId('scene-loaded'));

  // Simulate star click
  const canvas = screen.getByRole('img'); // R3F canvas has role="img"
  fireEvent.click(canvas, { clientX: 100, clientY: 100 });

  // Verify detail overlay
  expect(screen.getByTestId('detail-overlay')).toBeVisible();
});
```

### 6. E2E Tests (5% of test suite)

**Target:** Critical user journeys in real browser

**Framework:** Playwright

**Test Scenarios:**
1. **First-time user flow:**
   - Visit site → See permission prompt → Grant permissions → See stars
2. **Object interaction:**
   - Load app → Click on planet → See info card → Close card
3. **Cross-browser compatibility:**
   - Test on Chrome, Firefox, Safari (desktop + mobile viewports)
4. **Performance:**
   - Scene loads in < 3 seconds
   - 60 FPS maintained (use Playwright metrics)

**Example:**
```typescript
// e2e/star-map.spec.ts
test('user can view and interact with star map', async ({ page, context }) => {
  // Grant geolocation permission
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

  await page.goto('/');

  // Wait for scene to render
  await expect(page.locator('canvas')).toBeVisible();

  // Check for stars (via debug overlay or data attribute)
  await expect(page.locator('[data-testid="star-count"]')).toContainText('5000');

  // Click on canvas (simulate selecting a star)
  await page.locator('canvas').click({ position: { x: 400, y: 300 } });

  // Verify detail overlay appears
  await expect(page.locator('[data-testid="detail-overlay"]')).toBeVisible();
});
```

**Mobile Testing:**
```typescript
test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

test('mobile: orientation sensors work', async ({ page }) => {
  // Playwright can't truly mock DeviceOrientationEvent yet
  // Fallback: test that permission UI appears
  await page.goto('/');
  await expect(page.getByText(/enable device orientation/i)).toBeVisible();
});
```

## Test Organization

### Directory Structure

```
src/
├── lib/
│   ├── astronomy.ts
│   ├── store.ts
│   └── __tests__/
│       ├── astronomy.test.ts
│       ├── store.test.ts
│       └── coordinates.test.ts
├── hooks/
│   ├── useDeviceOrientation.ts
│   ├── useGPS.ts
│   └── __tests__/
│       ├── useDeviceOrientation.test.ts
│       └── useGPS.test.ts
├── components/
│   ├── dom/
│   │   ├── Overlay.tsx
│   │   ├── DetailOverlay.tsx
│   │   └── __tests__/
│   │       ├── Overlay.test.tsx
│   │       └── DetailOverlay.test.tsx
│   └── canvas/
│       ├── StarField.tsx
│       ├── Planets.tsx
│       └── __tests__/
│           ├── StarField.test.tsx
│           └── Planets.test.tsx
├── test/
│   ├── setup.ts                    # Vitest setup file
│   ├── mocks/
│   │   ├── three.ts                # Three.js mocks
│   │   ├── sensors.ts              # DeviceOrientation, Geolocation mocks
│   │   └── r3f.tsx                 # React Three Fiber test utils
│   ├── fixtures/
│   │   ├── stars.json              # Test star catalog (100 stars)
│   │   └── celestialBodies.ts      # Mock planet data
│   └── utils/
│       ├── renderWithProviders.tsx # Test wrapper with Zustand
│       └── astronomy-helpers.ts    # Test utilities for calculations
└── e2e/
    ├── star-map.spec.ts
    ├── permissions.spec.ts
    └── performance.spec.ts
```

### File Naming Conventions

- Unit/Component tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Test utilities: `test/utils/*.ts`
- Mocks: `test/mocks/*.ts`
- Fixtures: `test/fixtures/*.{ts,json}`

## Mocking Strategy

### 1. Three.js Mocks

**Challenge:** Three.js creates WebGL contexts, which don't exist in Node/JSDOM.

**Solution:**
```typescript
// test/mocks/three.ts
import { vi } from 'vitest';

export const mockVector3 = vi.fn(() => ({
  set: vi.fn().mockReturnThis(),
  applyQuaternion: vi.fn().mockReturnThis(),
  // ... other methods
}));

export const mockQuaternion = vi.fn(() => ({
  setFromEuler: vi.fn().mockReturnThis(),
  multiply: vi.fn().mockReturnThis(),
  copy: vi.fn().mockReturnThis(),
}));

// In vitest.config.ts
alias: {
  'three': path.resolve(__dirname, 'test/mocks/three.ts')
}
```

### 2. React Three Fiber Mocks

```typescript
// test/mocks/r3f.tsx
export const Canvas = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="r3f-canvas">{children}</div>
);

export const useFrame = vi.fn();
export const useThree = vi.fn(() => ({
  camera: mockCamera,
  scene: mockScene,
  gl: mockRenderer,
}));
```

### 3. Device Sensor Mocks

```typescript
// test/mocks/sensors.ts
export const mockGeolocation = (coords: { latitude: number; longitude: number }) => {
  const mock = {
    getCurrentPosition: vi.fn((success) =>
      success({
        coords: { ...coords, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
        timestamp: Date.now(),
      })
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  vi.stubGlobal('navigator', { geolocation: mock });
  return mock;
};

export const mockDeviceOrientation = (orientation: { alpha: number; beta: number; gamma: number }) => {
  const event = new Event('deviceorientation') as DeviceOrientationEvent;
  Object.assign(event, orientation);

  // Mock iOS permission
  if ('DeviceOrientationEvent' in window) {
    (DeviceOrientationEvent as any).requestPermission = vi.fn().mockResolvedValue('granted');
  }

  return { event, dispatchEvent: () => window.dispatchEvent(event) };
};
```

### 4. Astronomy Engine Mocks

```typescript
// For fast unit tests, mock expensive calculations
vi.mock('astronomy-engine', () => ({
  Equator: vi.fn(() => ({ ra: 5.5, dec: 10.0, dist: 100 })),
  Observer: vi.fn(),
  // For integration tests, use real library
}));
```

## Coverage Requirements

### Minimum Thresholds

```javascript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80,
  exclude: [
    'src/app/**', // Next.js pages (tested via E2E)
    '**/*.test.{ts,tsx}',
    'test/**',
    'e2e/**',
    '*.config.{ts,js}',
  ],
}
```

### Critical Path Coverage (90%+)

- Astronomy calculations (`lib/astronomy.ts`)
- Coordinate conversions (RA/Dec ↔ Cartesian)
- Store selectors and actions (`lib/store.ts`)
- Sensor data processing hooks

### Lower Priority Coverage (60-70%)

- UI components (already validated by E2E)
- Three.js wrapper components (hard to test, low logic)

## CI/CD Integration

### GitHub Actions Workflow

**Trigger:** On every push and pull request

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: npm run test:coverage -- --coverage.thresholdAutoUpdate=false

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build app
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Vercel Integration

**Preview Deployments:**
- Automatically deploy on every PR
- Run Lighthouse CI on preview URLs
- Check for console errors via Playwright smoke tests

**Configuration:**
```json
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false,
    "autoJobCancelation": true
  },
  "buildCommand": "npm run build && npm run test:e2e:vercel"
}
```

**Vercel Test Script:**
```json
{
  "scripts": {
    "test:e2e:vercel": "playwright test --grep @smoke --retries=2"
  }
}
```

### Pre-commit Hooks (Husky + lint-staged)

**Purpose:** Catch issues before commit

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

```bash
# .husky/pre-commit
npm run lint-staged
npm run type-check
```

## Performance Testing

### Metrics to Track

1. **Initial Load Time:** < 3 seconds (3G network)
2. **Time to Interactive:** < 5 seconds
3. **Frame Rate:** Maintain 60 FPS during interaction
4. **Memory Usage:** < 200 MB heap size
5. **Bundle Size:** < 500 KB (gzipped)

### Tools

- **Lighthouse CI:** Run on every Vercel preview
- **Playwright Performance API:** Track FPS in E2E tests
- **Bundlephobia:** Check dependency sizes

### Example Performance Test

```typescript
// e2e/performance.spec.ts
test('maintains 60 FPS during star map interaction', async ({ page }) => {
  await page.goto('/');

  // Start performance monitoring
  await page.evaluate(() => performance.mark('interaction-start'));

  // Simulate device movement (trigger camera updates)
  for (let i = 0; i < 100; i++) {
    await page.mouse.move(i * 5, 200);
    await page.waitForTimeout(16); // ~60 FPS
  }

  await page.evaluate(() => performance.mark('interaction-end'));

  const metrics = await page.evaluate(() => {
    performance.measure('interaction', 'interaction-start', 'interaction-end');
    return performance.getEntriesByType('measure')[0].duration;
  });

  // Should complete in ~1.6 seconds (100 frames * 16ms)
  expect(metrics).toBeLessThan(2000);
});
```

## Test Data Management

### Star Catalog for Tests

**Production:** `src/data/stars.json` (~5000 stars, ~500 KB)

**Test Fixture:** `test/fixtures/stars.json` (100 stars, ~10 KB)
- Ensures fast tests
- Covers edge cases: bright stars (mag < 0), pole stars (dec ≈ ±90°), equator stars

**Validation:**
```typescript
// test/utils/astronomy-helpers.ts
export const validateStarData = (star: Star) => {
  expect(star.ra).toBeGreaterThanOrEqual(0);
  expect(star.ra).toBeLessThan(24);
  expect(star.dec).toBeGreaterThanOrEqual(-90);
  expect(star.dec).toBeLessThanOrEqual(90);
  expect(star.mag).toBeTypeOf('number');
};
```

### Deterministic Astronomy Tests

**Challenge:** `astronomy-engine` uses current date/time by default.

**Solution:** Mock date in tests
```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-06-21T12:00:00Z')); // Summer solstice
});

afterEach(() => {
  vi.useRealTimers();
});
```

## Debugging Failed Tests

### Common Issues

1. **Three.js WebGL errors:**
   - Ensure proper mocks in `test/setup.ts`
   - Use headless-gl for Node environments if needed

2. **Sensor API unavailable:**
   - Check mocks are applied globally
   - Verify `vi.stubGlobal` in beforeEach

3. **Async timing issues:**
   - Use `waitFor` from Testing Library
   - Avoid `setTimeout` in tests

4. **Snapshot mismatches (3D components):**
   - Don't snapshot canvas pixels
   - Snapshot component structure only

### Debug Commands

```bash
# Run single test file
npm run test -- src/lib/__tests__/astronomy.test.ts

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Debug in VS Code
# Add breakpoint, then run "Debug Test" in command palette
```

## Continuous Improvement

### Quarterly Reviews

- Analyze coverage reports for gaps
- Review flaky tests (retries > 2)
- Update mocks to match real API changes
- Performance benchmarks trending

### Testing Metrics Dashboard

Track in GitHub Issues or project board:
- Test count by category
- Average test execution time
- Coverage percentage trend
- E2E test pass rate
- Flaky test rate

## Future Enhancements

### Phase 2 (Post-MVP)

- [ ] Visual regression testing (Percy, Chromatic)
- [ ] Accessibility automated testing (axe-core)
- [ ] Contract testing (if backend API added)
- [ ] Load testing (if multiplayer features added)
- [ ] Snapshot testing for constellation line rendering

### Phase 3 (Advanced)

- [ ] Real device testing (BrowserStack, Sauce Labs)
- [ ] Mutation testing (Stryker) for test quality
- [ ] A/B testing infrastructure
- [ ] Error tracking integration (Sentry)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing React Three Fiber](https://docs.pmnd.rs/react-three-fiber/advanced/testing)
- [Testing Zustand Stores](https://docs.pmnd.rs/zustand/guides/testing)

---

**Last Updated:** 2025-12-20
**Version:** 1.0
**Maintained By:** Development Team
