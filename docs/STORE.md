# Zustand Store Documentation

## Overview

The Star AR application uses [Zustand](https://github.com/pmndrs/zustand) for state management. The store provides a centralized, type-safe way to manage application state across both Canvas (3D) and DOM (UI) components.

## Store Location

The main store is defined in `src/lib/store.ts`.

## State Structure

### GPS Data
```typescript
interface GPSData {
  latitude: number;
  longitude: number;
  accuracy: number;  // Accuracy in meters
}
```

### Device Orientation
```typescript
interface DeviceOrientationData {
  alpha: number;     // Z-axis rotation (0-360°) - compass heading
  beta: number;      // X-axis rotation (-180 to 180°) - front-to-back tilt
  gamma: number;     // Y-axis rotation (-90 to 90°) - left-to-right tilt
}
```

### Celestial Body
```typescript
interface CelestialBodyData {
  type: 'star' | 'planet';
  name: string;
  ra: number;        // Right Ascension in hours (0-24)
  dec: number;       // Declination in degrees (-90 to 90)
  mag?: number;      // Apparent magnitude (for stars)
  con?: string;      // 3-letter constellation code (for stars)
  dist?: number;     // Distance in light-years
  hip?: number;      // Hipparcos catalog number (for stars)
}
```

### Permission States
```typescript
type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';
```

## Usage Examples

### Basic Usage

```typescript
import { useStarStore } from '@/lib/store';

function MyComponent() {
  const gps = useStarStore((state) => state.gps);
  const setGPS = useStarStore((state) => state.setGPS);

  // Use the GPS data or update it
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGPS(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy
        );
      });
    }
  }, [setGPS]);

  return <div>Lat: {gps?.latitude}, Lon: {gps?.longitude}</div>;
}
```

### Using Selector Hooks (Recommended)

For better performance and cleaner code, use the provided selector hooks:

```typescript
import { useGPS, useOrientation, useSelectedBody } from '@/lib/store';

function MyComponent() {
  const gps = useGPS();
  const orientation = useOrientation();
  const selectedBody = useSelectedBody();

  return (
    <div>
      {gps && <p>Location: {gps.latitude}, {gps.longitude}</p>}
      {orientation && <p>Heading: {orientation.alpha}°</p>}
      {selectedBody && <p>Selected: {selectedBody.name}</p>}
    </div>
  );
}
```

### Available Selector Hooks

- `useGPS()` - Returns GPS data
- `useOrientation()` - Returns device orientation
- `useSelectedBody()` - Returns selected celestial body
- `usePermissions()` - Returns both GPS and orientation permissions
- `useUIState()` - Returns loading and error state
- `useSettings()` - Returns display settings

## Actions

### GPS Actions

```typescript
const { setGPS, clearGPS, setGPSPermission } = useStarStore();

// Set GPS coordinates
setGPS(37.7749, -122.4194, 10);

// Clear GPS data
clearGPS();

// Update GPS permission state
setGPSPermission('granted');
```

### Device Orientation Actions

```typescript
const { setOrientation, clearOrientation, setOrientationPermission } = useStarStore();

// Set device orientation
setOrientation(45, 30, -15);

// Clear orientation data
clearOrientation();

// Update orientation permission state
setOrientationPermission('granted');
```

### Selection Actions

```typescript
const { selectCelestialBody, clearSelection } = useStarStore();

// Select a star
selectCelestialBody({
  type: 'star',
  name: 'Sirius',
  ra: 6.7525,
  dec: -16.7161,
  mag: -1.46,
  con: 'CMA',
  dist: 8.6,
  hip: 32349,
});

// Clear selection
clearSelection();
```

### UI State Actions

```typescript
const { setLoading, setError, clearError } = useStarStore();

// Show loading state
setLoading(true);

// Set error message
setError('Failed to get GPS location');

// Clear error
clearError();
```

### Settings Actions

```typescript
const { toggleConstellations, togglePlanets } = useStarStore();

// Toggle constellation visibility
toggleConstellations();

// Toggle planet visibility
togglePlanets();
```

### Reset Store

```typescript
const { reset } = useStarStore();

// Reset entire store to initial state
reset();
```

## Integration with Hooks

### Integrating with useGPS Hook

```typescript
// src/hooks/useGPS.ts
import { useEffect } from 'react';
import { useStarStore } from '@/lib/store';

export function useGPSIntegration() {
  const setGPS = useStarStore((state) => state.setGPS);
  const setGPSPermission = useStarStore((state) => state.setGPSPermission);
  const setError = useStarStore((state) => state.setError);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGPSPermission('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGPS(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy
        );
        setGPSPermission('granted');
      },
      (error) => {
        setError(error.message);
        setGPSPermission('denied');
      }
    );
  }, [setGPS, setGPSPermission, setError]);
}
```

### Integrating with useDeviceOrientation Hook

```typescript
// src/hooks/useDeviceOrientation.ts
import { useEffect } from 'react';
import { useStarStore } from '@/lib/store';

export function useDeviceOrientationIntegration() {
  const setOrientation = useStarStore((state) => state.setOrientation);
  const setOrientationPermission = useStarStore((state) => state.setOrientationPermission);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        setOrientation(event.alpha, event.beta, event.gamma);
      }
    };

    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            setOrientationPermission('granted');
            window.addEventListener('deviceorientation', handleOrientation);
          } else {
            setOrientationPermission('denied');
          }
        })
        .catch(() => setOrientationPermission('denied'));
    } else {
      setOrientationPermission('granted');
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [setOrientation, setOrientationPermission]);
}
```

## Integration with Canvas Components

### Using Store in Three.js/R3F Components

```typescript
// src/components/canvas/CameraController.tsx
import { useFrame } from '@react-three/fiber';
import { useOrientation } from '@/lib/store';
import * as THREE from 'three';

export function CameraController() {
  const orientation = useOrientation();

  useFrame(({ camera }) => {
    if (!orientation) return;

    const { alpha, beta, gamma } = orientation;
    const alphaRad = THREE.MathUtils.degToRad(alpha);
    const betaRad = THREE.MathUtils.degToRad(beta);
    const gammaRad = THREE.MathUtils.degToRad(gamma);

    const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ');
    const q1 = new THREE.Quaternion().setFromEuler(euler);
    const q2 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 2
    );

    camera.quaternion.copy(q1).multiply(q2);
  });

  return null;
}
```

### Handling Clicks in Canvas

```typescript
// src/components/canvas/StarField.tsx
import { useStarStore } from '@/lib/store';

export function StarField() {
  const selectCelestialBody = useStarStore((state) => state.selectCelestialBody);

  const handleStarClick = (starData: any) => {
    selectCelestialBody({
      type: 'star',
      name: starData.name,
      ra: starData.ra,
      dec: starData.dec,
      mag: starData.mag,
      con: starData.con,
      dist: starData.dist,
      hip: starData.hip,
    });
  };

  return (
    <instancedMesh onClick={(e) => {
      const instanceId = e.instanceId;
      if (instanceId !== undefined) {
        handleStarClick(starsData[instanceId]);
      }
    }}>
      {/* ... */}
    </instancedMesh>
  );
}
```

## Testing with the Store

### Using renderWithProviders

```typescript
import { renderWithProviders } from '@/test/utils/renderWithProviders';
import { useStarStore } from '@/lib/store';

describe('MyComponent', () => {
  it('should display GPS data', () => {
    const { getByText } = renderWithProviders(<MyComponent />);

    // Update store
    const { setGPS } = useStarStore.getState();
    setGPS(37.7749, -122.4194, 10);

    expect(getByText(/37.7749/)).toBeInTheDocument();
  });
});
```

### Direct Store Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useStarStore } from '@/lib/store';

it('should update GPS data', () => {
  const { result } = renderHook(() => useStarStore());

  act(() => {
    result.current.setGPS(37.7749, -122.4194, 10);
  });

  expect(result.current.gps).toEqual({
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
  });
});
```

## DevTools

The store is configured with Zustand DevTools in development mode. You can use the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools) to:

- Inspect current state
- View action history
- Time-travel debug
- Export/import state snapshots

## Performance Considerations

### Use Selector Hooks

Always prefer the provided selector hooks (`useGPS()`, `useOrientation()`, etc.) over direct store access to minimize re-renders.

**Good:**
```typescript
const gps = useGPS();
```

**Bad:**
```typescript
const gps = useStarStore((state) => state.gps);
```

### Avoid Selecting Entire Store

Don't select the entire store if you only need specific values:

**Good:**
```typescript
const gps = useStarStore((state) => state.gps);
```

**Bad:**
```typescript
const store = useStarStore();
const gps = store.gps;
```

### Memoize Selectors

For complex selectors, use `useMemo` or create custom selector hooks:

```typescript
export const useIsLocationAvailable = () =>
  useStarStore((state) =>
    state.gps !== null && state.gpsPermission === 'granted'
  );
```

## Common Patterns

### Permission Flow

```typescript
function PermissionPanel() {
  const { gpsPermission, orientationPermission } = usePermissions();
  const setGPSPermission = useStarStore((state) => state.setGPSPermission);
  const setOrientationPermission = useStarStore((state) => state.setOrientationPermission);

  const requestPermissions = async () => {
    // Request GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGPSPermission('granted'),
        () => setGPSPermission('denied')
      );
    }

    // Request Device Orientation (iOS 13+)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const response = await DeviceOrientationEvent.requestPermission();
      setOrientationPermission(response === 'granted' ? 'granted' : 'denied');
    }
  };

  return (
    <button onClick={requestPermissions}>
      Grant Permissions
    </button>
  );
}
```

### Display Selected Body

```typescript
function DetailOverlay() {
  const selectedBody = useSelectedBody();
  const clearSelection = useStarStore((state) => state.clearSelection);

  if (!selectedBody) return null;

  return (
    <div>
      <h2>{selectedBody.name}</h2>
      <p>Type: {selectedBody.type}</p>
      <p>RA: {selectedBody.ra.toFixed(4)} hours</p>
      <p>Dec: {selectedBody.dec.toFixed(4)}°</p>
      {selectedBody.mag && <p>Magnitude: {selectedBody.mag}</p>}
      {selectedBody.dist && <p>Distance: {selectedBody.dist} ly</p>}
      <button onClick={clearSelection}>Close</button>
    </div>
  );
}
```

## Troubleshooting

### Store Not Updating

Make sure you're calling the action functions, not just reading the state:

```typescript
// Wrong
const setGPS = useStarStore((state) => state.setGPS);
setGPS = (lat, lon, acc) => { /* ... */ };  // Overwriting the action!

// Right
const setGPS = useStarStore((state) => state.setGPS);
setGPS(lat, lon, acc);  // Calling the action
```

### Too Many Re-renders

Use selector hooks to limit what state each component subscribes to:

```typescript
// This will re-render on ANY store change
const store = useStarStore();

// This only re-renders when GPS changes
const gps = useGPS();
```

### Store Not Resetting in Tests

Make sure you're using `renderWithProviders` which includes automatic store cleanup:

```typescript
import { renderWithProviders } from '@/test/utils/renderWithProviders';

// This automatically resets the store after each test
renderWithProviders(<MyComponent />);
```

## Future Enhancements

Potential additions to the store:

- **Time Control**: Add date/time state for celestial calculations
- **Search History**: Track recently viewed celestial bodies
- **User Preferences**: Theme, language, measurement units
- **Offline Cache**: Store downloaded star catalog data
- **AR Calibration**: Store compass calibration offsets

---

For more information on Zustand, visit the [official documentation](https://github.com/pmndrs/zustand).
