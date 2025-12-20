# Star AR Project - Comprehensive TODO List

> **Last Updated**: 2025-12-20
> **Project Status**: Early Infrastructure Phase (20% complete)
> **Current Priority**: Core AR Feature Implementation

---

## 📊 Project Overview

The Star AR project currently has **excellent infrastructure** (CI/CD, testing framework, documentation) but **0% of core AR features** are implemented. The landing page is complete, but the actual AR star map functionality needs to be built from scratch.

### Implementation Status
- ✅ **Completed**: Landing page, test infrastructure, CI/CD, documentation
- ⚠️ **In Progress**: None
- ❌ **Not Started**: All AR/3D functionality

---

## 🔴 Critical Priority (Blockers)

These items must be completed before any meaningful AR development can proceed.

### CRIT-1: Fix Development Environment
- [ ] Run `npm install` to install all dependencies
- [ ] Verify build succeeds with `npm run build`
- [ ] Verify type-check passes with `npm run type-check`
- [ ] Run `npm audit` and fix security vulnerabilities

**Status**: Not started
**Blocking**: All development
**Estimated Effort**: 30 minutes

---

### CRIT-2: Fix Test Infrastructure
Current test files contain example implementations inside the test code itself, which is incorrect architecture.

- [ ] Remove example implementation from `src/lib/__tests__/coordinates.test.ts:23-36`
  - Move `raDecToCartesian()` function to `src/lib/astronomy.ts`
  - Update test to import and test actual implementation
- [ ] Remove example implementation from `src/hooks/__tests__/useGPS.test.ts`
  - Create actual `useGPS.ts` hook
  - Update test to test actual hook
- [ ] Remove placeholder test from `src/components/dom/__tests__/Overlay.test.tsx`
  - Will implement when Overlay component is created
- [ ] Verify all tests pass with `npm test`
- [ ] Verify coverage thresholds can be met (currently 0%, target 80%)

**Status**: Not started
**Blocking**: CI/CD pipeline, quality gates
**Estimated Effort**: 2-3 hours

---

### CRIT-3: Obtain Star Catalog Data
The production star catalog is missing. Need 5000+ stars for full experience.

**Options**:
1. **Quick MVP**: Use test fixture (`src/test/fixtures/starCatalog.json` - 20 stars)
   - Copy to `src/data/stars.json`
   - Update `STAR_COUNT` constant
   - Good for initial development/testing

2. **Production Data**: Obtain Hipparcos catalog subset
   - Download from astronomical databases
   - Filter to magnitude < 6.5 (visible to naked eye)
   - Process to required format: `{ hip, ra, dec, mag, con, dist }`
   - Aim for 5000-8000 stars

**Current Decision**: Start with test fixture (20 stars) for MVP

- [ ] Copy test fixture to `src/data/stars.json`
- [ ] Document data source and format in README
- [ ] Create issue for obtaining production catalog
- [ ] Add data processing script if needed

**Status**: Not started
**Blocking**: StarField implementation
**Estimated Effort**: 1-2 hours (MVP), 1-2 days (production data)

---

## 🟡 High Priority - Core AR Features (MVP)

These are the minimum features needed for a functional AR star map.

### HP-1: Core Hooks Implementation

#### HP-1.1: GPS Hook (`src/hooks/useGPS.ts`)
Implement geolocation wrapper for accessing user's GPS coordinates.

**Requirements**:
- Request location permission
- Handle permission denial gracefully
- Provide loading/error states
- Return `{ latitude, longitude, altitude, accuracy }`
- Auto-update on position change (optional for MVP)

**Acceptance Criteria**:
- [ ] Create `src/hooks/useGPS.ts`
- [ ] Implement permission request flow
- [ ] Handle error states (denied, unavailable, timeout)
- [ ] Return coordinates with proper TypeScript types
- [ ] Write unit tests (80% coverage)
- [ ] Test on mobile device (real GPS)
- [ ] Update existing test file to test actual implementation

**Reference**: CLAUDE.md lines 85-86, README.md section on GPS
**Estimated Effort**: 4-6 hours
**Dependencies**: None

---

#### HP-1.2: Device Orientation Hook (`src/hooks/useDeviceOrientation.ts`)
Implement sensor fusion for device orientation with iOS 13+ permission handling.

**Requirements**:
- Request DeviceOrientation permission (iOS 13+)
- Handle permission flow (must be user gesture)
- Listen to `deviceorientation` events
- Return `{ alpha, beta, gamma }` (euler angles in degrees)
- Handle permission denial
- Clean up event listeners on unmount

**Acceptance Criteria**:
- [ ] Create `src/hooks/useDeviceOrientation.ts`
- [ ] Implement iOS permission request (user gesture required)
- [ ] Add event listeners for `deviceorientation`
- [ ] Convert raw sensor data to usable format
- [ ] Handle Android vs iOS differences
- [ ] Write unit tests with mocked sensors
- [ ] Test on actual iOS device (real permission flow)
- [ ] Document permission requirements

**Reference**: CLAUDE.md lines 66-73, README.md sensor section
**Estimated Effort**: 6-8 hours
**Dependencies**: None

---

### HP-2: Astronomy Library (`src/lib/astronomy.ts`)

Core utilities for celestial calculations and coordinate conversions.

**Required Functions**:
1. `raDecToCartesian(ra, dec, radius)` - Convert celestial coords to 3D
2. `calculateLST(longitude, date)` - Local Sidereal Time calculation
3. `getPlanetPosition(bodyName, date, observer)` - Wrapper for astronomy-engine
4. `equatorialToHorizontal(ra, dec, lst, latitude)` - Alt/Az conversion (future)

**Acceptance Criteria**:
- [ ] Create `src/lib/astronomy.ts`
- [ ] Implement `raDecToCartesian()` (move from test file)
  - Formula: See CLAUDE.md lines 38-44
  - Input: RA (hours), Dec (degrees), radius
  - Output: `{ x, y, z }` in Three.js coordinate system
- [ ] Implement `calculateLST()`
  - Use astronomy-engine or manual calculation
  - Account for longitude and current time
- [ ] Implement `getPlanetPosition()`
  - Wrap astronomy-engine API
  - Return `{ ra, dec, dist, name }`
- [ ] Add TypeScript types for all functions
- [ ] Write comprehensive unit tests (80%+ coverage)
- [ ] Test with known celestial coordinates (validate accuracy)

**Reference**: CLAUDE.md lines 33-59, README.md astronomy section
**Estimated Effort**: 6-8 hours
**Dependencies**: astronomy-engine package

---

### HP-3: Zustand Store (`src/lib/store.ts`)

State management for selected celestial bodies and UI state.

**Required State**:
```typescript
{
  selectedBody: CelestialBodyData | null,
  setSelectedBody: (body: CelestialBodyData | null) => void,
  gpsEnabled: boolean,
  orientationEnabled: boolean,
  // Future: search filters, time travel state, etc.
}
```

**Acceptance Criteria**:
- [ ] Create `src/lib/store.ts`
- [ ] Define `CelestialBodyData` type
- [ ] Implement Zustand store with actions
- [ ] Add DevTools support (development only)
- [ ] Write unit tests for store actions
- [ ] Document store usage in code comments

**Reference**: CLAUDE.md line 88
**Estimated Effort**: 2-3 hours
**Dependencies**: zustand package

---

### HP-4: 3D Scene Setup (`src/components/canvas/Scene.tsx`)

Main R3F Canvas wrapper and orchestration component.

**Requirements**:
- Set up React Three Fiber Canvas
- Configure camera (FOV, near/far planes)
- Add basic lighting
- Include CelestialSphere component
- Include CameraController component
- Handle WebGL context loss
- Disable SSR (use dynamic import in ar/page.tsx)

**Acceptance Criteria**:
- [ ] Create `src/components/canvas/Scene.tsx`
- [ ] Configure R3F Canvas with proper settings
  - Camera: `fov={75}`, `position={[0, 0, 0.1]}`
  - Background: `#000000` (black)
  - `gl={{ antialias: true, alpha: false }}`
- [ ] Add ambient lighting
- [ ] Render CelestialSphere child component
- [ ] Include CameraController
- [ ] Add error boundary for WebGL errors
- [ ] Test on desktop (OrbitControls for debugging)
- [ ] Update `src/app/ar/page.tsx` to use Scene
  - Dynamic import with `ssr: false`

**Reference**: CLAUDE.md lines 21-25, README.md Scene section
**Estimated Effort**: 4-5 hours
**Dependencies**: HP-5 (CameraController), HP-7 (CelestialSphere)

---

### HP-5: Camera Controller (`src/components/canvas/CameraController.tsx`)

Syncs Three.js camera rotation to device orientation sensors.

**Requirements**:
- Use `useDeviceOrientation` hook
- Convert euler angles to quaternions (avoid gimbal lock)
- Apply -90° X rotation (phone vs camera coordinate system)
- Update camera rotation in `useFrame`
- Handle missing sensor data gracefully

**Acceptance Criteria**:
- [ ] Create `src/components/canvas/CameraController.tsx`
- [ ] Import `useDeviceOrientation` hook
- [ ] Implement euler → quaternion conversion
  - Formula: See CLAUDE.md lines 75-82
  - Order: 'YXZ' for proper rotation
- [ ] Apply camera orientation correction
- [ ] Update camera quaternion in `useFrame`
- [ ] Add fallback for desktop (no sensors)
- [ ] Test on mobile device (verify alignment)
- [ ] Document coordinate system transformations

**Reference**: CLAUDE.md lines 75-82, README.md camera section
**Estimated Effort**: 5-6 hours
**Dependencies**: HP-1.2 (useDeviceOrientation)

---

### HP-6: Star Field Component (`src/components/canvas/StarField.tsx`)

Renders 5000+ stars using InstancedMesh for performance.

**Requirements**:
- Load star data from `src/data/stars.json`
- Create InstancedMesh (single draw call)
- Convert RA/Dec to Cartesian coordinates
- Scale stars by magnitude (brightness)
- Enable click detection for individual stars
- Support 5000+ stars at 60 FPS

**Acceptance Criteria**:
- [ ] Create `src/components/canvas/StarField.tsx`
- [ ] Load `stars.json` data (use dynamic import or static)
- [ ] Create InstancedMesh with correct count
  - Geometry: `<sphereGeometry args={[0.15, 8, 8]} />`
  - Material: `<meshBasicMaterial color="white" />`
- [ ] Loop through stars and set positions
  - Use `raDecToCartesian()` from astronomy.ts
  - Set matrix via `meshRef.current.setMatrixAt(i, matrix)`
- [ ] Implement magnitude-based scaling
  - Brighter stars (lower mag) = larger spheres
  - Formula: `scale = 1 / (mag + 1)` or similar
- [ ] Add click detection
  - Use raycasting to detect `instanceId`
  - Update Zustand store with selected star
- [ ] Optimize for mobile (test on real device)
- [ ] Add performance monitoring (FPS counter)

**Reference**: CLAUDE.md lines 84-97, README.md StarField section
**Estimated Effort**: 8-10 hours
**Dependencies**: HP-2 (astronomy.ts), HP-3 (store), CRIT-3 (star data)

---

### HP-7: Celestial Sphere Container (`src/components/canvas/CelestialSphere.tsx`)

Parent group that applies LST rotation and latitude tilt to align celestial coordinates with real world.

**Requirements**:
- Use GPS coordinates from `useGPS`
- Calculate Local Sidereal Time (LST)
- Apply Y-axis rotation (LST alignment)
- Apply X-axis tilt (latitude correction)
- Update rotation when GPS changes
- Contain StarField and Planets as children

**Acceptance Criteria**:
- [ ] Create `src/components/canvas/CelestialSphere.tsx`
- [ ] Import `useGPS` hook
- [ ] Calculate LST using `calculateLST()` from astronomy.ts
- [ ] Apply rotation to group
  - Y-rotation: LST in radians
  - X-tilt: (90° - latitude) in radians
- [ ] Render children (StarField, Planets)
- [ ] Memoize calculations (expensive)
- [ ] Test alignment with known stars (e.g., Polaris)
- [ ] Document coordinate system transformations

**Reference**: CLAUDE.md lines 47-52, README.md alignment section
**Estimated Effort**: 4-5 hours
**Dependencies**: HP-1.1 (useGPS), HP-2 (astronomy.ts)

---

### HP-8: Basic Planet Rendering (`src/components/canvas/Planets.tsx`)

Render planets at real-time calculated positions using astronomy-engine.

**Requirements (MVP)**:
- Render 5-8 major planets
- Calculate positions using astronomy-engine
- Update positions periodically (not every frame)
- Make planets clickable
- Color code by planet type

**Acceptance Criteria**:
- [ ] Create `src/components/canvas/Planets.tsx`
- [ ] Define planet list (Mercury through Neptune, plus Moon/Sun)
- [ ] Implement position calculation
  - Use `getPlanetPosition()` from astronomy.ts
  - Create Observer with GPS coordinates
  - Convert returned RA/Dec to Cartesian
- [ ] Render planets as individual meshes
  - Larger spheres than stars
  - Color coded (Mars=red, Jupiter=orange, etc.)
- [ ] Implement click handlers
  - Update Zustand store with selected planet
- [ ] Throttle updates (every 10 frames, not 60 FPS)
- [ ] Use `useMemo` for expensive calculations
- [ ] Test on mobile (verify positions match sky)

**Reference**: CLAUDE.md lines 99-107, README.md planets section
**Estimated Effort**: 6-8 hours
**Dependencies**: HP-1.1 (useGPS), HP-2 (astronomy.ts), HP-3 (store)

---

### HP-9: Permission/Status Overlay (`src/components/dom/Overlay.tsx`)

DOM overlay for permission prompts and status messages.

**Requirements**:
- GPS permission prompt
- Device orientation permission prompt (iOS)
- Loading states
- Error messages
- Status indicators (GPS locked, orientation active)

**Acceptance Criteria**:
- [ ] Create `src/components/dom/Overlay.tsx`
- [ ] Create permission request UI
  - "Enable GPS" button
  - "Enable Sensors" button (iOS)
  - Trigger hooks' permission methods
- [ ] Show loading states
  - "Acquiring GPS..."
  - "Calibrating sensors..."
- [ ] Display error messages
  - Permission denied
  - GPS unavailable
  - Sensor unavailable
- [ ] Add status indicators
  - GPS accuracy indicator
  - Calibration quality indicator
- [ ] Style with CSS modules
- [ ] Make dismissible after permissions granted
- [ ] Write component tests

**Reference**: CLAUDE.md line 26, README.md overlay section
**Estimated Effort**: 4-5 hours
**Dependencies**: HP-1.1 (useGPS), HP-1.2 (useDeviceOrientation)

---

### HP-10: Detail Overlay for Selected Objects (`src/components/dom/DetailOverlay.tsx`)

Info card that appears when user taps a star or planet.

**Requirements**:
- Subscribe to Zustand store
- Display selected body information
- Dismiss on close button or tap outside
- Animate in/out smoothly

**Acceptance Criteria**:
- [ ] Create `src/components/dom/DetailOverlay.tsx`
- [ ] Subscribe to `selectedBody` from store
- [ ] Display body information
  - Name
  - Type (star/planet)
  - Magnitude (stars)
  - Distance
  - Constellation (stars)
  - RA/Dec coordinates
- [ ] Add close button
  - Calls `setSelectedBody(null)`
- [ ] Add backdrop click to dismiss
- [ ] Implement slide-up animation
- [ ] Style with CSS modules (match landing page theme)
- [ ] Write component tests
- [ ] Test on mobile (touch interactions)

**Reference**: CLAUDE.md line 27, README.md interaction section
**Estimated Effort**: 3-4 hours
**Dependencies**: HP-3 (store)

---

### HP-11: Update AR Page (`src/app/ar/page.tsx`)

Replace placeholder with actual AR experience.

**Acceptance Criteria**:
- [ ] Remove placeholder message
- [ ] Add dynamic import for Scene component
  - Use `next/dynamic` with `ssr: false`
- [ ] Add Overlay component
- [ ] Add DetailOverlay component
- [ ] Update page metadata (title, description)
- [ ] Add error boundary
- [ ] Test build succeeds
- [ ] Test on mobile device (full integration)

**Reference**: CLAUDE.md line 24
**Estimated Effort**: 2-3 hours
**Dependencies**: HP-4 through HP-10

---

## 🟢 Medium Priority - Polish & Enhancement

These features improve UX but aren't required for MVP.

### MP-1: Error Boundaries
- [ ] Create `src/app/error.tsx` (global error boundary)
- [ ] Create `src/app/ar/error.tsx` (AR-specific errors)
- [ ] Handle WebGL context loss
- [ ] Display user-friendly error messages
- [ ] Add "Reload" button
- [ ] Log errors to console (or Sentry in future)

**Estimated Effort**: 2-3 hours

---

### MP-2: Loading States
- [ ] Create loading screen for AR page
- [ ] Show while 3D scene initializes
- [ ] Display progress indicators
- [ ] Animate star map fade-in
- [ ] Handle slow networks gracefully

**Estimated Effort**: 2-3 hours

---

### MP-3: PWA Manifest & Icons
- [ ] Create `public/manifest.json`
  - App name: "Star"
  - Description
  - Theme colors
  - Display mode: standalone
- [ ] Generate app icons
  - Favicon (16x16, 32x32)
  - Apple touch icon (180x180)
  - PWA icons (192x192, 512x512)
- [ ] Add to `layout.tsx` metadata
- [ ] Add `robots.txt`
- [ ] Test installation on mobile

**Estimated Effort**: 2-3 hours

---

### MP-4: Improve Landing Page CTA
Currently landing page has buttons that need proper routing:

- [ ] Update "Launch Star Map" button
  - Link to `/ar`
  - Show browser compatibility warning if needed
- [ ] Add browser detection
  - Warn if no GPS support
  - Warn if no DeviceOrientation support
  - Suggest compatible browsers
- [ ] Add feature detection before routing
- [ ] Update copy to reflect MVP status (if needed)

**Estimated Effort**: 1-2 hours

---

### MP-5: Accessibility Improvements
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen readers
- [ ] Add skip links
- [ ] Verify color contrast (WCAG AA)
- [ ] Add reduced motion support
- [ ] Run axe-core audit

**Estimated Effort**: 3-4 hours

---

### MP-6: Performance Optimization
- [ ] Add bundle analysis script
  - `npm run analyze`
  - Check astronomy-engine size
  - Check Three.js tree-shaking
- [ ] Implement code splitting
  - Dynamic import for astronomy-engine
  - Lazy load Planets component
- [ ] Add performance marks/measures
  - Measure star field init time
  - Measure frame time
  - Track FPS
- [ ] Optimize star sphere geometry
  - Reduce segments for smaller stars
  - Test with 6/6 vs 8/8 segments
- [ ] Add performance budget to CI
  - Bundle size limits
  - Lighthouse CI thresholds

**Estimated Effort**: 4-6 hours

---

### MP-7: Improved Testing Coverage
Current coverage: 0%, Target: 80%

- [ ] Write tests for LandingPage component (currently no tests)
- [ ] Write integration tests
  - GPS → Store → UI flow
  - Orientation → Camera → Rendering flow
  - Click star → Store → DetailOverlay flow
- [ ] Add visual regression tests
  - Percy or Chromatic integration
  - Snapshot landing page
  - Snapshot AR overlays
- [ ] Add E2E tests for AR experience
  - Mock sensors in Playwright
  - Test permission flows
  - Test star selection
- [ ] Verify coverage thresholds met (80%)

**Estimated Effort**: 8-10 hours

---

### MP-8: Documentation Updates
Current docs describe a complete app but reality is different.

- [ ] Update README.md
  - Add implementation status badges
  - Add "Quick Start" section
  - Update screenshots (if any)
  - Mark unimplemented features clearly
- [ ] Update CLAUDE.md
  - Add implementation status section
  - Update file structure (show what exists)
- [ ] Create CONTRIBUTING.md
  - Development workflow
  - Coding standards
  - PR process
  - Testing requirements
- [ ] Create CHANGELOG.md
  - Track major milestones
  - Document breaking changes
- [ ] Add LICENSE file (if not present)
- [ ] Add CODE_OF_CONDUCT.md (if open source)

**Estimated Effort**: 3-4 hours

---

### MP-9: Production Star Catalog
Currently using test fixture with 20 stars.

**Goal**: Obtain and integrate 5000+ star catalog for production

**Options**:
1. **Hipparcos Catalog**
   - Download from VizieR or similar
   - Filter magnitude < 6.5
   - Process to required format

2. **Yale Bright Star Catalog**
   - Public domain
   - ~9000 stars
   - Pre-filtered to naked eye visibility

3. **Custom Processing Script**
   - Create `scripts/process-stars.js`
   - Input: Raw catalog (CSV/TSV)
   - Output: `src/data/stars.json`
   - Include constellation lookup

**Acceptance Criteria**:
- [ ] Research data sources (licensing, format)
- [ ] Obtain catalog data
- [ ] Create processing script (if needed)
- [ ] Generate `src/data/stars.json` with 5000+ stars
- [ ] Validate data quality
  - Check RA/Dec ranges
  - Verify magnitude distribution
  - Test constellation codes
- [ ] Update `STAR_COUNT` in StarField.tsx
- [ ] Test performance with full catalog
- [ ] Document data source in README

**Estimated Effort**: 1-2 days
**Dependencies**: HP-6 (StarField must be implemented first)

---

## 🔵 Low Priority - Future Features

Features mentioned in CLAUDE.md as "future enhancements."

### LP-1: Constellation Lines
- [ ] Load constellation line data
  - Star-to-star connections per constellation
  - JSON format: `{ constellation, lines: [[star1, star2], ...] }`
- [ ] Render using Three.js LineSegments
- [ ] Toggle visibility (UI control)
- [ ] Style lines (color, opacity)

**Estimated Effort**: 4-6 hours

---

### LP-2: Deep-Sky Objects
- [ ] Obtain catalog (Messier, NGC)
- [ ] Add to data layer
- [ ] Render as textured sprites
- [ ] Add to interaction system
- [ ] Include in DetailOverlay

**Estimated Effort**: 6-8 hours

---

### LP-3: Time Travel Mode
- [ ] Add time picker UI component
- [ ] Update astronomy calculations with custom date
- [ ] Animate celestial movement
- [ ] Show time speed controls (1x, 10x, 100x)
- [ ] Add preset times (sunset, midnight, sunrise)

**Estimated Effort**: 8-10 hours

---

### LP-4: Compass/AR Anchoring
- [ ] Request compass permission
- [ ] Use `deviceorientationabsolute` event
- [ ] Align to true North (not magnetic)
- [ ] Add calibration UI
- [ ] Handle magnetic interference

**Estimated Effort**: 6-8 hours

---

### LP-5: Search & Filter UI
- [ ] Create search input component
- [ ] Implement star/planet search
  - Autocomplete
  - Search by name, constellation, type
- [ ] Add filter controls
  - Magnitude range
  - Constellation
  - Object type
- [ ] Highlight search results in 3D
- [ ] Add "Find in Sky" camera animation

**Estimated Effort**: 10-12 hours

---

### LP-6: Screenshot/Photo Mode
- [ ] Add screenshot button to UI
- [ ] Capture Canvas to image
- [ ] Add watermark/timestamp
- [ ] Download or share
- [ ] Handle permissions (clipboard, downloads)

**Estimated Effort**: 3-4 hours

---

## 🛠️ Infrastructure & DevOps

### INF-1: Monitoring & Analytics
- [ ] Integrate Sentry for error tracking
  - Add `NEXT_PUBLIC_SENTRY_DSN` to .env
  - Configure Sentry in `src/app/layout.tsx`
  - Test error reporting
- [ ] Add analytics (optional)
  - Configure analytics provider
  - Track page views
  - Track AR session duration
  - Track errors/permissions denied
- [ ] Add performance monitoring
  - WebGL performance metrics
  - Bundle size tracking
  - Lighthouse CI

**Estimated Effort**: 3-4 hours

---

### INF-2: Content Security Policy
- [ ] Add CSP headers to `vercel.json`
- [ ] Allow necessary sources
  - Three.js WebGL context
  - Inline styles (if needed)
- [ ] Test in production
- [ ] Add to documentation

**Estimated Effort**: 1-2 hours

---

### INF-3: Security Audit
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review dependency licenses
- [ ] Add Dependabot (GitHub)
- [ ] Set up automated security scanning
- [ ] Document security practices in CONTRIBUTING.md

**Estimated Effort**: 2-3 hours

---

### INF-4: Project Management Setup
- [ ] Create GitHub Projects board
- [ ] Add milestones
  - MVP (High Priority items)
  - v1.0 (Medium Priority items)
  - v2.0 (Low Priority items)
- [ ] Create issues for each TODO item
- [ ] Add issue templates
  - Bug report
  - Feature request
  - Question
- [ ] Set up PR template
- [ ] Configure branch protection rules

**Estimated Effort**: 2-3 hours

---

## 📋 Implementation Roadmap

### Phase 1: MVP (Core AR Experience)
**Goal**: Functional AR star map with basic features
**Timeline**: ~2-3 weeks for experienced developer

**Includes**:
- All CRIT items (Critical Priority)
- All HP items (High Priority)

**Success Criteria**:
- User can grant GPS and sensor permissions
- Device orientation controls camera view
- Stars render at correct positions based on location
- Planets render at correct positions
- User can tap stars/planets to see info
- Runs at 60 FPS on mobile

---

### Phase 2: Polish (Production-Ready)
**Goal**: Production-quality app with good UX
**Timeline**: ~1-2 weeks

**Includes**:
- All MP items (Medium Priority)

**Success Criteria**:
- 80%+ test coverage
- Lighthouse score > 90
- PWA installable
- Full accessibility compliance
- Production star catalog (5000+ stars)
- Comprehensive documentation

---

### Phase 3: Advanced Features (Future)
**Goal**: Premium experience with unique features
**Timeline**: ~2-4 weeks

**Includes**:
- Selected LP items (Low Priority)
- Based on user feedback and priorities

**Success Criteria**:
- Constellation lines visible
- Time travel mode working
- Search/filter functional
- Deep-sky objects rendered

---

## 🎯 Current Sprint Recommendations

### Sprint 1: Foundation (Week 1)
1. CRIT-1: Fix development environment
2. CRIT-2: Fix test infrastructure
3. CRIT-3: Use test fixture for star data
4. HP-1.1: Implement useGPS
5. HP-1.2: Implement useDeviceOrientation
6. HP-2: Implement astronomy.ts
7. HP-3: Implement Zustand store

**Deliverable**: Core hooks and utilities working and tested

---

### Sprint 2: 3D Rendering (Week 2)
1. HP-4: Scene setup
2. HP-5: CameraController
3. HP-7: CelestialSphere
4. HP-6: StarField (with 20 stars)
5. HP-11: Update AR page

**Deliverable**: Stars visible and aligned to real world

---

### Sprint 3: Interaction & Planets (Week 3)
1. HP-8: Planet rendering
2. HP-9: Overlay component
3. HP-10: DetailOverlay component
4. MP-1: Error boundaries
5. MP-2: Loading states

**Deliverable**: Full MVP with planets and interaction

---

### Sprint 4: Quality & Testing (Week 4)
1. MP-7: Testing coverage
2. MP-6: Performance optimization
3. MP-3: PWA manifest
4. MP-8: Documentation updates
5. INF-1: Monitoring setup

**Deliverable**: Production-ready v1.0

---

## 📊 Metrics & Success Criteria

### Code Quality Metrics
- [ ] Test coverage ≥ 80%
- [ ] TypeScript strict mode enabled
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] 100% of tests passing

### Performance Metrics
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] 60 FPS in AR mode on mobile
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse Performance score > 90

### Feature Completeness
- [ ] MVP features: 11/11 (High Priority items)
- [ ] Polish features: 0/9 (Medium Priority items)
- [ ] Advanced features: 0/6 (Low Priority items)

### User Experience
- [ ] GPS permission flow tested on iOS/Android
- [ ] Sensor permission flow tested on iOS 13+
- [ ] Star positions verified against real sky
- [ ] Planet positions verified against ephemeris
- [ ] Interaction tested on touch devices

---

## 🐛 Known Issues

### Current Bugs
None (no implementation to have bugs yet)

### Technical Debt
1. **Template test implementations** - Need to move to actual files
2. **Documentation-reality gap** - Docs describe complete app
3. **Missing star catalog** - Only 20-star test fixture exists
4. **No error handling** - Not implemented yet
5. **TypeScript `@ts-nocheck`** - Should be removed from vitest.config.ts

---

## 📚 Resources & References

### Documentation
- [README.md](./README.md) - Technical design (725 lines)
- [CLAUDE.md](./CLAUDE.md) - Project guide (311 lines)
- [TESTING.md](./TESTING.md) - Testing strategy (737 lines)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide (169 lines)

### External Resources
- [astronomy-engine docs](https://github.com/cosinekitty/astronomy)
- [Three.js docs](https://threejs.org/docs/)
- [React Three Fiber docs](https://docs.pmnd.rs/react-three-fiber/)
- [Next.js 14 docs](https://nextjs.org/docs)
- [Zustand docs](https://docs.pmnd.rs/zustand/)

### Star Catalogs
- [Hipparcos Catalog](http://vizier.u-strasbg.fr/viz-bin/VizieR?-source=I/239)
- [Yale Bright Star Catalog](http://tdc-www.harvard.edu/catalogs/bsc5.html)
- [Constellation Line Data](https://github.com/dcf21/constellation-stick-figures)

---

## 💡 Notes

### Architecture Decisions
- Using InstancedMesh for stars (performance critical)
- Using individual meshes for planets (only 8-10 objects)
- Client-side astronomy calculations (privacy)
- No server-side rendering for 3D components
- Zustand over Redux (simpler, smaller)

### Browser Compatibility
- **iOS 13+**: Requires DeviceOrientation permission
- **Android**: Generally works without permission
- **Desktop**: No sensors, but can use OrbitControls for debug
- **WebGL**: Required, no fallback planned for MVP

### Testing Philosophy
- Unit test all hooks and utilities (80%+ coverage)
- Component test UI components
- Mock Three.js for unit tests
- Use real Three.js for integration tests
- E2E test critical user flows only

---

## ✅ Completion Checklist

Use this checklist to track overall project completion:

### Phase 1: MVP ⬜ 0/14
- ⬜ CRIT-1: Development environment
- ⬜ CRIT-2: Test infrastructure
- ⬜ CRIT-3: Star catalog data
- ⬜ HP-1.1: useGPS hook
- ⬜ HP-1.2: useDeviceOrientation hook
- ⬜ HP-2: astronomy.ts library
- ⬜ HP-3: Zustand store
- ⬜ HP-4: Scene component
- ⬜ HP-5: CameraController
- ⬜ HP-6: StarField
- ⬜ HP-7: CelestialSphere
- ⬜ HP-8: Planets
- ⬜ HP-9: Overlay
- ⬜ HP-10: DetailOverlay

### Phase 2: Polish ⬜ 0/9
- ⬜ MP-1: Error boundaries
- ⬜ MP-2: Loading states
- ⬜ MP-3: PWA manifest
- ⬜ MP-4: Landing page CTA
- ⬜ MP-5: Accessibility
- ⬜ MP-6: Performance optimization
- ⬜ MP-7: Testing coverage
- ⬜ MP-8: Documentation updates
- ⬜ MP-9: Production star catalog

### Phase 3: Advanced ⬜ 0/6
- ⬜ LP-1: Constellation lines
- ⬜ LP-2: Deep-sky objects
- ⬜ LP-3: Time travel mode
- ⬜ LP-4: Compass anchoring
- ⬜ LP-5: Search & filter
- ⬜ LP-6: Screenshot mode

### Infrastructure ⬜ 0/4
- ⬜ INF-1: Monitoring & analytics
- ⬜ INF-2: Content Security Policy
- ⬜ INF-3: Security audit
- ⬜ INF-4: Project management

---

**Total Tasks**: 44
**Completed**: 0
**In Progress**: 0
**Not Started**: 44

**Overall Completion**: 0%

---

_This TODO.md is a living document. Update it as tasks are completed, priorities change, or new requirements emerge._
