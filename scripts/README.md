# Star Catalog Processing Scripts

This directory contains utilities for processing and validating star catalog data for the Star AR application.

## Scripts

### `process-stars.js`

Converts raw star catalog data (CSV/TSV format) into the JSON format required by the application.

**Usage:**
```bash
node scripts/process-stars.js <input-file> [output-file]

# Example:
node scripts/process-stars.js hipparcos.csv src/data/stars.json

# Or use npm script:
npm run process-stars -- hipparcos.csv
```

**Input Format:**

CSV or TSV file with columns:
- `HIP` - Hipparcos catalog number
- `RA` - Right Ascension in hours (0-24)
- `DEC` - Declination in degrees (-90 to +90)
- `MAG` - Apparent magnitude
- `CON` - IAU 3-letter constellation code
- `DIST` - Distance in light-years
- `NAME` - Common name (optional)

Example CSV:
```csv
HIP,RA,DEC,MAG,CON,DIST,NAME
677,0.1396,29.0906,2.06,AND,97.2,Alpheratz
2081,0.4453,-42.306,2.39,PHE,77.3,Ankaa
```

**Output Format:**

JSON array of star objects:
```json
[
  {
    "hip": 677,
    "ra": 0.1396,
    "dec": 29.0906,
    "mag": 2.06,
    "con": "AND",
    "dist": 97.2,
    "name": "Alpheratz"
  }
]
```

**Features:**
- Automatic delimiter detection (comma or tab)
- Filters stars by magnitude (default: mag < 6.5 for naked eye visibility)
- Validates data format and ranges
- Reports statistics (magnitude distribution, constellation counts)
- Sorts output by brightness (magnitude)

**Configuration:**

Edit the `CONFIG` object in the script to adjust:
- `maxMagnitude` - Filter threshold (default: 6.5)
- `validConstellations` - IAU constellation codes

---

### `validate-stars.js`

Validates the integrity of the star catalog JSON file and generates statistics.

**Usage:**
```bash
node scripts/validate-stars.js [stars-file]

# Default validates src/data/stars.json:
node scripts/validate-stars.js

# Or validate a specific file:
node scripts/validate-stars.js path/to/stars.json

# Or use npm script:
npm run validate-stars
```

**Validation Checks:**
- ✓ All required fields present (`hip`, `ra`, `dec`, `mag`, `con`, `dist`, `name`)
- ✓ HIP ID is a positive number
- ✓ RA is between 0-24 hours
- ✓ Dec is between -90 to +90 degrees
- ✓ Magnitude is a number (warns if outside typical range)
- ✓ Constellation is a valid IAU 3-letter code
- ✓ Distance is a positive number
- ✓ Name is a non-empty string

**Output:**

The script provides:
1. **Validation Results** - Count of errors and warnings
2. **Error Details** - Specific issues with individual stars (up to 10)
3. **Catalog Statistics**:
   - Total star count
   - Magnitude range (min/max/avg)
   - Distance range (min/max/avg)
   - Constellation distribution
   - Brightest 5 stars
   - Nearest 5 stars

**Exit Codes:**
- `0` - Validation passed
- `1` - Validation failed or error occurred

---

## NPM Scripts

For convenience, these scripts are available via npm:

```bash
# Validate current star catalog
npm run validate-stars

# Process raw catalog data
npm run process-stars -- input.csv [output.json]
```

---

## Obtaining Star Catalog Data

For production deployment, you'll need a larger star catalog (5,000-8,000 stars). Here are recommended sources:

### Option 1: Hipparcos Catalog (Recommended)

1. Visit [VizieR](http://vizier.u-strasbg.fr/viz-bin/VizieR?-source=I/239)
2. Select Hipparcos Main Catalogue
3. Filter: `Vmag < 6.5` (naked eye visibility)
4. Export columns: `HIP, RAhms, DEdms, Vmag, Plx, SpType`
5. Process with `process-stars.js`

**Note:** You may need to convert coordinates from HMS/DMS to decimal degrees.

### Option 2: Yale Bright Star Catalog

1. Download from [Harvard TDC](http://tdc-www.harvard.edu/catalogs/bsc5.html)
2. Parse the fixed-width format (or find CSV version)
3. Process with `process-stars.js`

**Advantage:** Already filtered to naked-eye visibility (~9,000 stars)

### Option 3: Pre-processed Datasets

Search for community-curated star catalogs in JSON format:
- GitHub repositories
- Astronomical data archives
- Community astronomy projects

Ensure the license permits use and that data quality meets requirements.

---

## Data Quality Guidelines

When processing star catalogs, ensure:

1. **Coordinate Precision**: At least 4 decimal places for RA/Dec
2. **Magnitude Range**: Focus on stars with mag < 6.5 (visible to naked eye)
3. **Complete Metadata**: Include constellation codes and common names where available
4. **Distance Data**: Use parallax measurements to calculate distance in light-years
5. **Validation**: Always run `validate-stars.js` on processed data

---

## Performance Considerations

- **Mobile Target**: 5,000-8,000 stars for 60 FPS on mobile devices
- **File Size**: Expect ~500KB-1MB for JSON file with 5,000+ stars
- **InstancedMesh**: The StarField component uses InstancedMesh for efficient rendering
- **Sorting**: Process script sorts by magnitude (brightest first) for optimal LOD

---

## Example Workflow

Complete workflow for obtaining production star catalog:

```bash
# 1. Download Hipparcos catalog data
wget "http://vizier.u-strasbg.fr/..." -O hipparcos_raw.csv

# 2. Process the data
npm run process-stars -- hipparcos_raw.csv src/data/stars.json

# 3. Validate the output
npm run validate-stars

# 4. Test in application
npm run dev
# Navigate to /ar and verify star positions

# 5. Commit if validation passes
git add src/data/stars.json
git commit -m "feat: Update star catalog with Hipparcos data (5000+ stars)"
```

---

## Troubleshooting

### "Invalid RA/Dec range" errors
- Check coordinate format (decimal hours/degrees, not HMS/DMS)
- Ensure proper column mapping in input file

### "Invalid constellation code" errors
- Verify 3-letter IAU codes (not full names)
- Check for typos or non-standard abbreviations
- Missing codes default to "UNK"

### Large file size
- Filter by magnitude more aggressively (e.g., mag < 6.0 instead of 6.5)
- Remove unnecessary fields from JSON output
- Consider gzip compression for deployment

### Performance issues with full catalog
- Reduce sphere geometry segments in StarField.tsx
- Implement magnitude-based LOD (render brightest stars first)
- Test on actual mobile devices, not just desktop

---

## Related Documentation

- [README.md](../README.md) - Section 8: Star Catalog Data
- [CLAUDE.md](../CLAUDE.md) - Data Requirements section
- [TODO.md](../TODO.md) - CRIT-3 and MP-9
- [.github/ISSUE_TEMPLATE_PRODUCTION_CATALOG.md](../.github/ISSUE_TEMPLATE_PRODUCTION_CATALOG.md)

---

**Last Updated**: 2025-12-21
