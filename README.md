# Star - Web-Based Interactive Star Map

## Technical Design Document

### 1. Architecture Overview

The application follows a client-heavy architecture where the browser handles the heavy lifting of sensor fusion, astronomical calculation, and 3D rendering.

**Core Data Flow:**
* **Input**: User grants Geolocation (Lat/Long) and Device Orientation (Alpha/Beta/Gamma) permissions.
* **Calculation**: The Astronomy Engine calculates the current Local Sidereal Time (LST) and converts Celestial Coordinates (RA/Dec) of stars into Local Horizontal Coordinates (Azimuth/Altitude) or directly aligns the 3D container to the celestial sphere.
* **Synchronization**: The Sensor Controller maps device rotation to the Three.js Camera.
* **Rendering**: React Three Fiber renders thousands of stars using InstancedMesh for 60FPS performance on mobile.

### 2. Recommended Tech Stack

| Category | Technology | Reasoning |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Robust routing, SSR for initial shell, and optimized asset delivery. |
| 3D Engine | Three.js + React Three Fiber (R3F) | Declarative 3D scene management consistent with React state. |
| Helpers | @react-three/drei | Essential utilities (OrbitControls for debug, Html overlays, Text). |
| Astronomy Math | astronomy-engine | Highly accurate, lightweight JS library for calculating RA/Dec and planet positions. |
| State Management | Zustand | Minimalist store for sharing sensor data and user location between the DOM and Canvas. |
| Performance | Three.js InstancedMesh | Crucial for rendering 5,000+ stars with a single draw call. |

### 3. Key Technical Challenges & Solutions

#### A. iOS 13+ Permissions Strategy

Since iOS 13, access to DeviceOrientationEvent is disabled by default and requires an explicit user gesture (e.g., a button click) to request permission.

**Solution:**
* On load, check if DeviceOrientationEvent and requestPermission exist.
* If they do, render a "Start Stargazing" overlay button.
* On click, call `DeviceOrientationEvent.requestPermission()`.
* Handle granted or denied states.

#### B. Sensor Fusion (Mapping Device to Camera)

Raw alpha, beta, gamma values from the device are Euler angles, which suffer from gimbal lock.

**Solution:**
We must convert these Euler angles into a Quaternion for the Three.js camera.
* Get device orientation.
* Adjust for screen orientation (portrait/landscape).
* Apply a -90 degree rotation around the X-axis (because mobile phones "look" out the back of the screen, whereas Three.js cameras look down the negative Z-axis).

#### C. Celestial Coordinate System

Stars are mapped using Right Ascension (RA) and Declination (Dec).
* **RA (0h to 24h)**: Analogous to Longitude on the celestial sphere.
* **Dec (-90° to +90°)**: Analogous to Latitude.

**Math:**
To place a star on a unit sphere (radius R):

```
x = R * cos(Dec) * cos(RA)
y = R * sin(Dec)
z = R * cos(Dec) * sin(RA)
```

*Note: You may need to swap Y/Z depending on whether you treat Y as "up" (standard Three.js) or Z as "up".*

### 4. Project Structure

Recommended structure for Next.js App Router:

```
src/
├── app/
│   ├── page.tsx             // Main entry, dynamic import of StarMap (to disable SSR for 3D)
│   └── layout.tsx           // Global styles
├── components/
│   ├── canvas/
│   │   ├── Scene.tsx        // R3F Canvas setup
│   │   ├── StarField.tsx    // InstancedMesh for stars
│   │   ├── Planets.tsx      // Individual meshes for planets
│   │   └── CameraController.tsx // Handles device orientation logic
│   ├── dom/
│   │   ├── Overlay.tsx      // UI for permissions/location status
│   │   └── Loader.tsx
├── hooks/
│   ├── useDeviceOrientation.ts // Logic for listeners and permissions
│   └── useGPS.ts            // Logic for Geolocation API
├── lib/
│   ├── astronomy.ts         // Wrapper for astronomy-engine calculations
│   └── store.ts             // Zustand store
└── data/
    └── stars.json           // Pre-processed catalog (Hipparcos reduced)
```

### 5. Core Component Implementation

#### A. The Sensor Hook (hooks/useDeviceOrientation.ts)

This hook handles the tricky iOS permission request.

```typescript
import { useState, useCallback, useEffect } from 'react';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

export const useDeviceOrientation = () => {
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });

  const requestAccess = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermission('granted');
        } else {
          setPermission('denied');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Non-iOS 13+ devices typically allow access by default
      setPermission('granted');
    }
  }, []);

  useEffect(() => {
    if (permission === 'granted') {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setOrientation({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0,
        });
      };
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [permission]);

  return { permission, requestAccess, orientation };
};
```

#### B. The Camera Controller (components/canvas/CameraController.tsx)

This component syncs the Three.js camera with the device sensors.

```typescript
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

export const CameraController = () => {
  const { camera } = useThree();
  const { orientation } = useDeviceOrientation(); // Assume this reads from a store or context for performance

  useFrame(() => {
    // 1. Create Euler from device orientation
    // Alpha: rotation around Z, Beta: X, Gamma: Y
    const { alpha, beta, gamma } = orientation;

    // Convert degrees to radians
    const alphaRad = THREE.MathUtils.degToRad(alpha);
    const betaRad = THREE.MathUtils.degToRad(beta);
    const gammaRad = THREE.MathUtils.degToRad(gamma);

    // 2. Create Quaternion
    // Note: The order 'ZXY' is crucial for device orientation
    const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ');
    const q1 = new THREE.Quaternion().setFromEuler(euler);

    // 3. Adjust for screen orientation (if user rotates phone to landscape)
    // -90 deg rotation for alignment
    const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    // Apply rotations
    camera.quaternion.copy(q1).multiply(q2);
    camera.updateMatrixWorld();
  });

  return null;
};
```

#### C. The Star Field (components/canvas/StarField.tsx)

Using InstancedMesh is mandatory for performance. We render thousands of spheres with one draw call.

```typescript
import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import starData from '@/data/stars.json'; // Assume array of { ra, dec, mag }

const STAR_COUNT = 5000;
const UNIVERSE_RADIUS = 100;

export const StarField = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    starData.slice(0, STAR_COUNT).forEach((star, i) => {
      // 1. Convert Celestial (RA/Dec) to Cartesian (x, y, z)
      // RA is usually in hours (0-24), Dec in degrees
      const raRad = (star.ra * 15) * (Math.PI / 180); // Convert hours to degrees, then radians
      const decRad = star.dec * (Math.PI / 180);

      // Spherical conversion
      const x = UNIVERSE_RADIUS * Math.cos(decRad) * Math.cos(raRad);
      const y = UNIVERSE_RADIUS * Math.sin(decRad); // Up axis
      const z = UNIVERSE_RADIUS * Math.cos(decRad) * Math.sin(raRad);

      // 2. Position the dummy object
      dummy.position.set(x, y, z);

      // 3. Scale based on magnitude (brighter stars = larger)
      // Magnitude is inverse logarithmic (lower is brighter)
      const scale = Math.max(0.1, 2.0 - (star.mag * 0.2));
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Optional: Set color based on spectral type here
      meshRef.current!.setColorAt(i, new THREE.Color('white'));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
};
```

### 6. Planetary System Implementation

This is the "brain" of your application. While Three.js handles the visuals, astronomy-engine handles the truth.

To render planets accurately, we cannot use static databases like we did for stars. Planets move significantly every hour. We must calculate their position in real-time based on the user's Time and Location (Latitude/Longitude).

#### The Coordinate Strategy

To keep our 3D scene consistent, we will place everything (Stars and Planets) in the Equatorial Coordinate System (RA/Dec).
* **The Center (0,0,0)**: The Earth (Observer).
* **The Container**: A giant sphere representing the Celestial Sphere.
* **The Alignment**: We will calculate the planets' current Right Ascension (RA) and Declination (Dec) and place them alongside the stars.

#### Implementation: Planets.tsx

This component calculates the live positions of the solar system bodies.

**Dependencies:**
```bash
npm install astronomy-engine
```

**The Component Code:**

```typescript
import { useMemo } from 'react';
import * as THREE from 'three';
import { Astronomy, DefineStar } from 'astronomy-engine';
import { Text, Billboard } from '@react-three/drei';

// The distance to place planets (visual only, they are effectively infinite for AR)
const PLANET_RADIUS = 90;

interface PlanetsProps {
  latitude: number;
  longitude: number;
}

// List of bodies to track
const BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'
];

export const Planets = ({ latitude, longitude }: PlanetsProps) => {
  const date = new Date(); // Current time

  // Memoize calculations so we don't recalculate on every frame unless location changes
  const planetPositions = useMemo(() => {
    // 1. Create the Observer
    const observer = new Astronomy.Observer(latitude, longitude, 0);

    return BODIES.map((bodyName) => {
      // 2. Calculate Topocentric Coordinates
      // This accounts for the user's specific location on Earth (parallax)
      // which is crucial for the Moon, less so for distant planets.
      const equPoint = Astronomy.Equator(
        bodyName as any,
        date,
        observer,
        true, // specific to observer
        true  // precise calculation
      );

      // 3. Convert RA/Dec to 3D Cartesian (Same math as StarField)
      const raRad = (equPoint.ra * 15) * (Math.PI / 180); // RA is in hours
      const decRad = equPoint.dec * (Math.PI / 180);

      // Note: We use the same sphere projection as the stars
      const x = PLANET_RADIUS * Math.cos(decRad) * Math.cos(raRad);
      const y = PLANET_RADIUS * Math.sin(decRad);
      const z = PLANET_RADIUS * Math.cos(decRad) * Math.sin(raRad);

      return {
        name: bodyName,
        position: new THREE.Vector3(x, y, z),
        // Calculate visual scale (Sun/Moon huge, others small points)
        scale: bodyName === 'Sun' || bodyName === 'Moon' ? 5 : 1.5,
        color: getPlanetColor(bodyName)
      };
    });
  }, [latitude, longitude]);

  return (
    <group>
      {planetPositions.map((planet) => (
        <group key={planet.name} position={planet.position}>
          {/* Use Billboard so text/plane always faces the camera */}
          <Billboard>
            <mesh>
              <circleGeometry args={[planet.scale, 32]} />
              <meshBasicMaterial color={planet.color} />
            </mesh>
            <Text
              position={[0, -planet.scale - 1, 0]} // Label below the planet
              fontSize={1.5}
              color="white"
              anchorX="center"
              anchorY="top"
            >
              {planet.name}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
};

// Helper for aesthetics
function getPlanetColor(name: string) {
  switch (name) {
    case 'Sun': return '#FDB813';
    case 'Moon': return '#F4F6F0';
    case 'Mars': return '#E27B58';
    case 'Venus': return '#E3BB76';
    case 'Jupiter': return '#C88B3A';
    case 'Saturn': return '#C5AB6E';
    default: return '#FFFFFF';
  }
}
```

#### World Alignment: CelestialSphere.tsx

We now have Stars and Planets placed correctly relative to each other in the 3D scene (using RA/Dec). However, we must rotate the entire celestial sphere so that it aligns with the user's real-world horizon and North.

**The Math for Alignment:**
* **LST (Local Sidereal Time)**: This tells us "which star is currently directly overhead (at the meridian)."
* **Latitude**: This tilts the sphere. If you are at the North Pole, Polaris is overhead. If you are at the Equator, Polaris is on the horizon.

**Implementation:**

```typescript
import { useMemo } from 'react';
import { Astronomy } from 'astronomy-engine';
import { StarField } from './StarField';
import { Planets } from './Planets';

export const CelestialSphere = ({ latitude, longitude }: { latitude: number, longitude: number }) => {

  // Calculate the rotation needed to align the RA/Dec sphere with the local world
  const universeRotation = useMemo(() => {
    const date = new Date();

    // 1. Calculate Local Sidereal Time (LST) in hours
    // Astronomy engine calculates this precisely
    const lst = Astronomy.SiderealTime(date) + (longitude / 15.0);

    // 2. Convert to Radians
    // The sky appears to rotate -15 degrees per hour of sidereal time
    const rotationY = -THREE.MathUtils.degToRad(lst * 15);

    // 3. Latitude Tilt
    // We tilt the sphere so the celestial pole aligns with user's latitude
    // 90 - Latitude is the co-latitude
    const rotationX = THREE.MathUtils.degToRad(90 - latitude);

    return new THREE.Euler(rotationX, rotationY, 0, 'YXZ');
  }, [latitude, longitude]);

  return (
    // This Group rotates the entire universe to match Earth's current rotation
    <group rotation={universeRotation}>
      <StarField />
      <Planets latitude={latitude} longitude={longitude} />
      {/* Optional: Add Grid/Constellation Lines here */}
    </group>
  );
};
```

#### Integration into Scene

```typescript
// components/canvas/Scene.tsx
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { CelestialSphere } from './CelestialSphere';
import { useGPS } from '@/hooks/useGPS'; // Gets { lat, long }

export default function Scene() {
  const { location } = useGPS(); // Your custom hook

  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
      {/* 1. Sync Camera with Phone Gyro */}
      <CameraController />

      {/* 2. Render the Universe (Only if we have GPS) */}
      {location ? (
        <CelestialSphere
          latitude={location.latitude}
          longitude={location.longitude}
        />
      ) : null}

      {/* 3. Black background */}
      <color attach="background" args={['black']} />
    </Canvas>
  );
}
```

### 7. Interactive Selection System

**Challenges:**
* Raycasting against different types of meshes: Our stars are a single massive InstancedMesh, while planets are individual meshes. We need a unified way to detect clicks on both.
* Bridging Canvas and DOM: The 3D scene handles the click, but a standard React HTML component should display the information overlay.

We will use Zustand (a lightweight state management library) to act as the bridge between the 3D world and the UI world.

#### The State Bridge (Zustand Store)

**File: src/lib/store.ts**

```typescript
import { create } from 'zustand';

// Define the shape of data for stars and planets
export interface CelestialBodyData {
  type: 'star' | 'planet';
  name: string;
  magnitude?: number; // Visual brightness
  distance?: string;   // Light years or AU
  constellation?: string; // 3-letter code (e.g., 'ORI')
  description?: string;
}

interface AppState {
  selectedBody: CelestialBodyData | null;
  selectBody: (data: CelestialBodyData) => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedBody: null,
  selectBody: (data) => set({ selectedBody: data }),
  clearSelection: () => set({ selectedBody: null }),
}));
```

#### Making Stars Interactive (InstancedMesh Raycasting)

**File: Modify src/components/canvas/StarField.tsx**

```typescript
import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber'; // Import R3F event type
import { useAppStore } from '@/lib/store';
import starDataRaw from '@/data/stars.json';

// Define your raw JSON shape
interface RawStar { hip: number; ra: number; dec: number; mag: number; con: string; dist: number }
const starData = starDataRaw as RawStar[];
const STAR_COUNT = 5000;
// ... other constants

export const StarField = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Grab the select action from the store
  const selectBody = useAppStore((state) => state.selectBody);

  useLayoutEffect(() => {
    // ... (same positioning logic as before) ...
  }, [dummy]);

  // The click handler receives a ThreeEvent containing intersection data
  const handleStarClick = (e: ThreeEvent<MouseEvent>) => {
    // Crucial: Stop ray from hitting things behind the star (like the background sphere if you have one)
    e.stopPropagation();

    // instanceId tells us which index in the count was hit
    const instanceId = e.instanceId;

    if (instanceId !== undefined && starData[instanceId]) {
        const star = starData[instanceId];

        selectBody({
            type: 'star',
            // Format name based on Hipparcos catalog ID
            name: `HIP ${star.hip}`,
            magnitude: star.mag,
            constellation: star.con,
            // Format distance (assuming your JSON has lightyears)
            distance: `${star.dist.toFixed(1)} ly`
        });
    }
  };

  return (
    <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, STAR_COUNT]}
        onClick={handleStarClick} // Attach the handler here
        // Add pointer cursor on hover for better desktop UX
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
};
```

#### Making Planets Interactive

**File: Modify src/components/canvas/Planets.tsx**

```typescript
// ... imports
import { ThreeEvent } from '@react-three/fiber';
import { useAppStore } from '@/lib/store';

// ... constants

export const Planets = ({ latitude, longitude }: PlanetsProps) => {
  const selectBody = useAppStore((state) => state.selectBody);
  // ... date setup

  const planetPositions = useMemo(() => {
    // ... observer setup
    return BODIES.map((bodyName) => {
       // ... Astronomy calculations (equPoint, etc)

       // Calculate distance in AU for display
       const distanceAU = equPoint.dist.toFixed(2) + " AU";

      return {
        name: bodyName,
        position: new THREE.Vector3(x, y, z),
        scale: bodyName === 'Sun' || bodyName === 'Moon' ? 5 : 1.5,
        color: getPlanetColor(bodyName),
        // Pack data required for the UI here
        uiData: {
             type: 'planet',
             name: bodyName,
             distance: distanceAU,
             // You could calculate live magnitude here using astronomy-engine too
             description: `${bodyName} of our solar system.`
        } as CelestialBodyData
      };
    });
  }, [latitude, longitude]);

  return (
    <group>
      {planetPositions.map((planet) => (
        <group
            key={planet.name}
            position={planet.position}
            // Add click handler to the group holding planet mesh + text
            onClick={(e: ThreeEvent<MouseEvent>) => {
                 e.stopPropagation();
                 selectBody(planet.uiData);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <Billboard>
             {/* ... mesh and text objects ... */}
          </Billboard>
        </group>
      ))}
    </group>
  );
};
```

#### The UI Overlay Component

**File: src/components/dom/DetailOverlay.tsx**

```typescript
import { useAppStore } from '@/lib/store';

export const DetailOverlay = () => {
  // Subscribe to store changes
  const { selectedBody, clearSelection } = useAppStore();

  if (!selectedBody) return null;

  return (
    // Simple Tailwind styles for a fixed bottom card overlay
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-slate-900/90 border border-slate-700 text-white p-6 rounded-2xl backdrop-blur-md z-50 animate-slide-up">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-sm uppercase tracking-wider text-blue-400">{selectedBody.type}</p>
           <h2 className="text-3xl font-bold">{selectedBody.name}</h2>
        </div>
        <button
          onClick={clearSelection}
          className="p-2 text-slate-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {selectedBody.magnitude !== undefined && (
          <div>
            <p className="text-slate-400">Magnitude</p>
            <p className="font-semibold text-lg">{selectedBody.magnitude.toFixed(1)}</p>
          </div>
        )}
         {selectedBody.constellation && (
          <div>
            <p className="text-slate-400">Constellation</p>
            <p className="font-semibold text-lg">{selectedBody.constellation}</p>
          </div>
        )}
        {selectedBody.distance && (
          <div className="col-span-2">
            <p className="text-slate-400">Distance from Earth</p>
            <p className="font-semibold text-lg">{selectedBody.distance}</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### Final Integration (Main Page)

**File: src/app/page.tsx**

```typescript
'use client';

import dynamic from 'next/dynamic';
import { DetailOverlay } from '@/components/dom/DetailOverlay';

// Dynamically import the Scene to disable SSR.
// Three.js relies heavily on the 'window' object and cannot run on the server.
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false,
  loading: () => <div className="bg-black h-screen w-screen flex items-center justify-center text-white">Loading Sky Data...</div>,
});

export default function Home() {
  return (
    <main className="h-screen w-screen bg-black relative overflow-hidden">
      {/* The 3D World */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* The 2D UI Overlay */}
      <div className="relative z-10 pointer-events-none">
          {/* We set pointer-events-none on the container so clicks pass through to the canvas,
              but enable pointer-events-auto on the actual buttons/cards inside DetailOverlay */}
         <div className="pointer-events-auto">
            <DetailOverlay />
         </div>

         {/* You might also put the "Start AR" permission button here */}
      </div>
    </main>
  );
}
```

## Summary

You now have a functional AR Star Map prototype with:

* **Device Sensors**: iOS permissions handled, sensors mapped to camera quaternion.
* **Star Data**: 5,000+ stars rendered efficiently with InstancedMesh using Cartesian conversion.
* **Planetary Data**: Real-time calculation of planet positions based on GPS and Time using astronomy-engine.
* **World Alignment**: The celestial sphere is rotated to match the user's local horizon and sidereal time.
* **Interaction**: A robust raycasting system using Zustand to bridge the 3D scene and a React UI overlay.
