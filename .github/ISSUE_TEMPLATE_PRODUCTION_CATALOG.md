## Overview
The application currently uses a test fixture with only 20 stars for MVP development. For a production-ready experience, we need to expand the star catalog to 5,000-8,000 stars.

## Current Status
- **Current catalog**: `src/data/stars.json` - 20 bright stars (test fixture)
- **Data format**: JSON with `{ hip, ra, dec, mag, con, dist, name }` schema
- **Source**: `src/test/fixtures/stars.json`

## Requirements

### Data Source Options
1. **Hipparcos Catalog** (Recommended)
   - High-precision astrometry
   - Available from [VizieR](http://vizier.u-strasbg.fr/viz-bin/VizieR?-source=I/239)
   - Filter to magnitude < 6.5 (naked eye visibility)
   - Expected result: 5,000-8,000 stars

2. **Yale Bright Star Catalog** (Alternative)
   - Public domain, ~9,000 stars
   - Available from [Harvard TDC](http://tdc-www.harvard.edu/catalogs/bsc5.html)
   - Already filtered to naked-eye visibility

### Data Processing
Create a script (`scripts/process-stars.js` or similar) to:
- Convert source catalog (CSV/TSV/FITS) to JSON
- Match the existing schema:
  ```json
  {
    "hip": 677,
    "ra": 0.1396,
    "dec": 29.0906,
    "mag": 2.06,
    "con": "AND",
    "dist": 97.2,
    "name": "Alpheratz"
  }
  ```
- Include constellation assignments
- Add common names where available
- Validate data quality (RA/Dec ranges, magnitude distribution)

### Acceptance Criteria
- [ ] Research and select data source (verify licensing)
- [ ] Download/obtain raw catalog data
- [ ] Create processing script
- [ ] Generate `src/data/stars.json` with 5,000+ stars
- [ ] Validate data quality:
  - RA range: 0-24 hours
  - Dec range: -90 to +90 degrees
  - Magnitude range: reasonable distribution
  - All constellation codes valid (IAU 3-letter codes)
- [ ] Test performance with full catalog on mobile (target: 60 FPS)
- [ ] Update `STAR_COUNT` constant if needed
- [ ] Document data source and processing in README

## Performance Considerations
- Current `StarField.tsx` uses InstancedMesh for efficient rendering
- Should handle 5,000-8,000 stars at 60 FPS on mobile
- May need to adjust sphere geometry segments if performance drops
- Consider magnitude-based LOD (show brighter stars first)

## Related Files
- `src/data/stars.json` - Target file
- `src/test/fixtures/stars.json` - Current test fixture
- `src/components/canvas/StarField.tsx` - Consumer of star data
- `README.md` - Documentation (section 8)

## Priority
**Medium** - Required for production but not blocking MVP development

## Dependencies
- Should be implemented after HP-6 (StarField component) is complete
- Blocks MP-9 (Production Star Catalog polish item)

## Resources
- [Hipparcos Catalog via VizieR](http://vizier.u-strasbg.fr/viz-bin/VizieR?-source=I/239)
- [Yale Bright Star Catalog](http://tdc-www.harvard.edu/catalogs/bsc5.html)
- [IAU Constellation Codes](https://www.iau.org/public/themes/constellations/)
- [Constellation Line Data](https://github.com/dcf21/constellation-stick-figures)
