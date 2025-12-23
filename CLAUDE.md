# Star - Project Guide for Claude Code

## Project Overview

Star is a web-based interactive AR star map that uses device sensors (GPS + gyroscope) to overlay celestial objects in real-time. Users point their phone at the sky and see stars, planets, and constellations accurately positioned based on their location and orientation.

**Tech Stack:**
- Next.js 14+ (App Router)
- Three.js + React Three Fiber (R3F)
- @react-three/drei
- astronomy-engine (celestial calculations)
- Zustand (state management)
- TypeScript

## Architecture at a Glance

```
User Device Sensors (GPS + Gyroscope)
           ↓
Sensor Fusion + Astronomy Calculations
           ↓
Three.js Scene (Celestial Sphere aligned to real world)
           ↓
60 FPS AR Experience
```

**Key Systems:**
1. **Sensor Layer**: Device orientation (alpha/beta/gamma) + GPS coordinates
2. **Astronomy Engine**: Converts celestial coordinates (RA/Dec) to 3D positions
3. **Alignment System**: Rotates celestial sphere using LST (Local Sidereal Time) and latitude
4. **Rendering**: InstancedMesh for 5000+ stars, individual meshes for planets
5. **Satellite System**: Real-time TLE parsing and SGP4 position calculation from CelesTrak
6. **Interaction**: Raycasting + Zustand bridge between Canvas and DOM UI

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main entry, dynamic import (no SSR)
│   └── layout.tsx                  # Global styles
├── components/
│   ├── canvas/                     # 3D components (run in R3F Canvas)
│   │   ├── Scene.tsx               # Canvas setup + orchestration
│   │   ├── StarField.tsx           # InstancedMesh for 5000+ stars
│   │   ├── Planets.tsx             # Real-time planet positions
│   │   ├── Satellites.tsx          # Satellite visualization from TLE data
│   │   ├── CelestialSphere.tsx     # Parent group with LST rotation
│   │   └── CameraController.tsx    # Syncs camera to device orientation
│   └── dom/                        # HTML/UI components
│       ├── Overlay.tsx             # Permission prompts, status
│       ├── DetailOverlay.tsx       # Info card when star/planet/satellite clicked
│       └── Loader.tsx
├── hooks/
│   ├── useDeviceOrientation.ts     # iOS permission + sensor listeners
│   ├── useGPS.ts                   # Geolocation API wrapper
│   └── useSatellites.ts            # TLE data fetching and state management
├── lib/
│   ├── astronomy.ts                # astronomy-engine helpers
│   ├── tle.ts                      # TLE parsing and SGP4 propagation
│   └── store.ts                    # Zustand store (selected body, etc)
└── data/
    └── stars.json                  # Hipparcos catalog subset (ra, dec, mag, etc)
```

## Critical Coordinate Systems

### 1. Celestial Coordinates (RA/Dec)
- **Right Ascension (RA)**: 0-24 hours (like longitude on the celestial sphere)
- **Declination (Dec)**: -90° to +90° (like latitude)
- Stars are stored in this system
- Planets are calculated into this system via astronomy-engine

### 2. Conversion to Cartesian (for Three.js)
```typescript
const raRad = (ra * 15) * (Math.PI / 180);  // hours → degrees → radians
const decRad = dec * (Math.PI / 180);

const x = R * Math.cos(decRad) * Math.cos(raRad);
const y = R * Math.sin(decRad);              // Y is up
const z = R * Math.cos(decRad) * Math.sin(raRad);
```

### 3. Local Alignment
The entire celestial sphere rotates based on:
- **LST (Local Sidereal Time)**: Rotation around Y-axis
- **Latitude**: Tilt of X-axis (90° - latitude)

## Key Implementation Notes

### iOS 13+ Permission Handling
```typescript
// MUST be triggered by user gesture (button click)
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  const response = await DeviceOrientationEvent.requestPermission();
  // handle granted/denied
}
```

### Sensor Fusion (Device → Camera)
```typescript
// Raw euler angles → Quaternion (avoid gimbal lock)
const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ');
const q1 = new THREE.Quaternion().setFromEuler(euler);

// Apply -90° X rotation (phone looks out back, camera looks down -Z)
const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

camera.quaternion.copy(q1).multiply(q2);
```

### Performance: InstancedMesh
Stars MUST use InstancedMesh (single draw call for 5000+ objects):
```typescript
<instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
  <sphereGeometry args={[0.15, 8, 8]} />
  <meshBasicMaterial color="white" />
</instancedMesh>
```

Each star's position/scale is set via:
```typescript
dummy.position.set(x, y, z);
dummy.updateMatrix();
meshRef.current.setMatrixAt(i, dummy.matrix);
```

### Planet Positions (Real-time)
```typescript
const observer = new Astronomy.Observer(latitude, longitude, 0);
const equPoint = Astronomy.Equator('Mars', new Date(), observer, true, true);
// equPoint contains { ra, dec, dist } → convert to Cartesian
```

### Satellite Positions (TLE Data)
```typescript
// Fetch from CelesTrak API
const { satellites, loading, error } = useSatellites({
  group: 'active',           // CelesTrak group (satellites, iridium, starlink, etc)
  constellation: 'STARLINK', // Optional: filter by constellation
  maxSatellites: 500,        // Limit for performance
  autoRefresh: true,         // Auto-update positions
});

// Satellites are calculated using simplified SGP4 propagation
// Positions are in Earth-centered coordinates (ECI) and scaled for visualization
```

**Key Differences from Stars/Planets:**
- Satellites orbit **Earth**, not appear on the celestial sphere
- **NOT** rotated with the celestial sphere (LST + latitude)
- Positions change **rapidly** (every few minutes for near-Earth satellites)
- **Much closer** to observer (400-36000 km altitude)
- Calculated from **orbital elements** (TLE), not astronomical bodies

### Interaction System
- **Canvas**: Click handlers on meshes detect instanceId (for stars) or direct mesh (for planets/satellites)
- **Store**: Zustand bridge passes CelestialBodyData to UI (updated to support `type: 'satellite'`)
- **DOM**: DetailOverlay component subscribes to store, shows info card

## Common Development Tasks

### Adding a New Star Catalog
1. Prepare JSON with `{ hip, ra, dec, mag, con, dist }` structure
2. Place in `src/data/stars.json`
3. Update `STAR_COUNT` in `StarField.tsx`
4. Ensure magnitude-to-scale formula handles your range

### Adding More Planets/Objects
1. Add body name to `BODIES` array in `Planets.tsx`
2. Ensure `astronomy-engine` supports it
3. Add color in `getPlanetColor()` helper
4. Scale adjustment if needed (e.g., asteroids smaller)

### Working with Satellite TLE Data
**Understanding TLE Format:**
```
Line 1: 1 25544U 98067A   24358.50000000  .00010270  00000+0  18614-3 0  9996
Line 2: 2 25544  51.6404  235.0395 0006278  47.0781  313.2490 15.50244706436153
```
- **NORAD ID**: 25544 (ISS)
- **Epoch**: 2024 day 358.5
- **Inclination**: 51.6404°
- **Mean Motion**: 15.50244706 revolutions/day (~92 minute orbit)
- **Eccentricity**: 0.0006278 (nearly circular)

**CelesTrak API Groups:**
- `active` - All active satellites (~9,000)
- `starlink` - Starlink constellation (~7,000)
- `oneweb` - OneWeb constellation (~600)
- `iridium` - Iridium constellation (~66)
- `gps-ops` - GPS satellites (~31)
- `stations` - Space stations (ISS, Mir, etc.)

**Fetching Specific Groups:**
```typescript
const { satellites } = useSatellites({ group: 'starlink' });
// or
const data = await fetchCelesTrakData('stations');
```

**Filtering and Limiting:**
```typescript
// Filter by constellation name
const starlinkSats = filterByConstellation(allSatellites, 'STARLINK');

// Limit for performance (important on mobile)
const maxSatellites = 500; // Adjust based on device capability

// Filter by altitude
const highOrbits = satellites.filter(sat => sat.altitude > 36000); // Geostationary
const lowOrbits = satellites.filter(sat => sat.altitude < 400); // LEO/decay
```

**Performance Considerations:**
- `maxSatellites: 500` is reasonable for most devices
- Update positions every ~1 second (satellites move slower than 60 FPS)
- Consider using InstancedMesh for 1000+ satellites
- LOD (Level of Detail): Only render satellites above a certain magnitude
- Culling: Only render satellites in view cone

### Debugging Alignment Issues
- **Stars appear rotated wrong**: Check LST calculation in `CelestialSphere.tsx`
- **Horizon doesn't match reality**: Verify latitude tilt (90 - latitude)
- **Camera orientation inverted**: Adjust quaternion multiplication order or axis angles

### Testing Without Device Sensors
Use `OrbitControls` from drei temporarily:
```typescript
import { OrbitControls } from '@react-three/drei';

<Canvas>
  <OrbitControls />  {/* Debug only */}
  <CelestialSphere />
</Canvas>
```

### Performance Optimization
- Keep `STAR_COUNT` reasonable (5000-8000 max on mobile)
- Use `useMemo` for astronomy calculations (they're expensive)
- Consider `useFrame` throttling if needed (e.g., update planets every 10 frames)
- Reduce sphere geometry segments: `<sphereGeometry args={[0.15, 6, 6]} />`

## Data Requirements

### stars.json Format
```json
[
  {
    "hip": 677,
    "ra": 0.1396,
    "dec": 29.0906,
    "mag": 2.06,
    "con": "AND",
    "dist": 97.2
  }
]
```
- `ra`: Right Ascension in hours (0-24)
- `dec`: Declination in degrees (-90 to 90)
- `mag`: Apparent magnitude (lower = brighter)
- `con`: 3-letter constellation code
- `dist`: Distance in light-years

## Security & Privacy

- **GPS**: User grants permission via browser API
- **Device Orientation**: Requires explicit user gesture on iOS 13+
- **Data**: All calculations client-side, no server uploads
- **Privacy**: Location never leaves device

## Deployment Considerations

- Disable SSR for 3D components (use `dynamic` with `ssr: false`)
- HTTPS required for sensor access on iOS
- Mobile-first: Test on real devices (simulators lack sensors)
- Bundle size: astronomy-engine is ~100KB, stars.json varies by catalog size

## Debugging Tips

### Camera Not Moving
- Check `DeviceOrientationEvent` listeners attached
- Verify permission granted
- Console log alpha/beta/gamma values

### Stars Not Visible
- Check camera position: `[0, 0, 0.1]` (not [0, 0, 0])
- Verify `UNIVERSE_RADIUS` larger than camera distance
- Check background color: should be black

### Planets in Wrong Position
- Verify observer coordinates match GPS
- Check system clock accuracy (astronomy-engine uses local time)
- Log `equPoint.ra` and `equPoint.dec` to validate

### Click Detection Not Working
- Ensure `onClick` on mesh, not group (unless group has mesh children)
- Check `e.stopPropagation()` to prevent ray going through
- Verify `raycaster` enabled (R3F default: enabled)

### Satellites Not Visible
- Enable satellites: Check `showSatellites` in store
- Verify CelesTrak API response: Check browser network tab
- Check position calculation: Log satellite positions in console
- Altitude sanity check: ISS ~400km, Geostationary ~36000km
- Scale factor: Satellites use different scale than celestial objects

### Satellite Positions Wrong
- Verify system clock is accurate (TLE calculations depend on precise time)
- Check GPS coordinates match your location
- CelesTrak data updates daily: May be stale if TLE is old
- Confirm `group` parameter matches available data

## Future Enhancements (if requested)

- Constellation lines (connect stars via LineSegments)
- Deep-sky objects (nebulae, galaxies from catalog)
- Time travel (adjust date, watch sky change)
- AR anchoring (align to compass North, not just gyro)
- Search/filter UI (find specific stars/planets/satellites)
- Screenshot/photo mode
- **Satellite Enhancements:**
  - InstancedMesh for 1000+ satellites (performance)
  - Satellite trails (predicted path)
  - Pass predictions (when satellite visible from your location)
  - Constellation-specific colors/filtering UI
  - Iridium flare predictions
  - More accurate SGP4/SDP4 propagation (use satellite-js library)

## References

- **Astronomy Engine Docs**: https://github.com/cosinekitty/astronomy
- **CelesTrak API**: https://celestrak.org/
- **TLE Format**: https://celestrak.org/NORAD/documentation/
- **SGP4 Propagation**: https://www.celestrak.org/NORAD/documentation/
- **satellite-js Library**: https://github.com/shashwatak/satellite-js (alternative to custom SGP4)
- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **Coordinate Systems**: IAU standards for RA/Dec
- **Device Orientation API**: MDN Web Docs

---

**Last Updated**: Based on README.md technical design document
