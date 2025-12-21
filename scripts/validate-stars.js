#!/usr/bin/env node

/**
 * Star Data Validation Script
 *
 * Validates the integrity of the star catalog JSON file.
 *
 * Usage:
 *   node scripts/validate-stars.js [stars-file]
 *
 * Default: src/data/stars.json
 */

const fs = require('fs');
const path = require('path');

// Valid IAU constellation codes
const VALID_CONSTELLATIONS = new Set([
  'AND', 'ANT', 'APS', 'AQR', 'AQL', 'ARA', 'ARI', 'AUR', 'BOO', 'CAE',
  'CAM', 'CNC', 'CVN', 'CMA', 'CMI', 'CAP', 'CAR', 'CAS', 'CEN', 'CEP',
  'CET', 'CHA', 'CIR', 'COL', 'COM', 'CRA', 'CRB', 'CRV', 'CRT', 'CRU',
  'CYG', 'DEL', 'DOR', 'DRA', 'EQU', 'ERI', 'FOR', 'GEM', 'GRU', 'HER',
  'HOR', 'HYA', 'HYI', 'IND', 'LAC', 'LEO', 'LMI', 'LEP', 'LIB', 'LUP',
  'LYN', 'LYR', 'MEN', 'MIC', 'MON', 'MUS', 'NOR', 'OCT', 'OPH', 'ORI',
  'PAV', 'PEG', 'PER', 'PHE', 'PIC', 'PSC', 'PSA', 'PUP', 'PYX', 'RET',
  'SGE', 'SGR', 'SCO', 'SCL', 'SCT', 'SER', 'SEX', 'TAU', 'TEL', 'TRI',
  'TRA', 'TUC', 'UMA', 'UMI', 'VEL', 'VIR', 'VOL', 'VUL', 'UNK'
]);

/**
 * Validate individual star object
 */
function validateStar(star, index) {
  const errors = [];

  // Check required fields exist
  const requiredFields = ['hip', 'ra', 'dec', 'mag', 'con', 'dist', 'name'];
  requiredFields.forEach(field => {
    if (!(field in star)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate HIP ID
  if (typeof star.hip !== 'number' || star.hip < 0) {
    errors.push(`Invalid HIP ID: ${star.hip} (must be positive number)`);
  }

  // Validate RA (Right Ascension: 0-24 hours)
  if (typeof star.ra !== 'number' || star.ra < 0 || star.ra >= 24) {
    errors.push(`Invalid RA: ${star.ra} (must be 0-24 hours)`);
  }

  // Validate Dec (Declination: -90 to +90 degrees)
  if (typeof star.dec !== 'number' || star.dec < -90 || star.dec > 90) {
    errors.push(`Invalid Dec: ${star.dec} (must be -90 to +90 degrees)`);
  }

  // Validate magnitude (typically -1.5 to 6.5 for visible stars)
  if (typeof star.mag !== 'number') {
    errors.push(`Invalid magnitude type: ${typeof star.mag} (must be number)`);
  } else if (star.mag < -2 || star.mag > 15) {
    // Warning for unusual magnitudes
    errors.push(`Unusual magnitude: ${star.mag} (typically -1.5 to 6.5 for naked eye)`);
  }

  // Validate constellation code
  if (typeof star.con !== 'string') {
    errors.push(`Invalid constellation type: ${typeof star.con} (must be string)`);
  } else if (!VALID_CONSTELLATIONS.has(star.con.toUpperCase())) {
    errors.push(`Invalid constellation code: ${star.con} (not a valid IAU 3-letter code)`);
  }

  // Validate distance (should be positive)
  if (typeof star.dist !== 'number' || star.dist < 0) {
    errors.push(`Invalid distance: ${star.dist} (must be positive number in light-years)`);
  }

  // Validate name
  if (typeof star.name !== 'string' || star.name.trim() === '') {
    errors.push(`Invalid name: ${star.name} (must be non-empty string)`);
  }

  return errors;
}

/**
 * Generate statistics for star catalog
 */
function generateStats(stars) {
  const stats = {
    count: stars.length,
    magnitude: {
      min: Math.min(...stars.map(s => s.mag)),
      max: Math.max(...stars.map(s => s.mag)),
      avg: stars.reduce((sum, s) => sum + s.mag, 0) / stars.length
    },
    distance: {
      min: Math.min(...stars.map(s => s.dist)),
      max: Math.max(...stars.map(s => s.dist)),
      avg: stars.reduce((sum, s) => sum + s.dist, 0) / stars.length
    },
    constellations: {},
    brightest: [...stars].sort((a, b) => a.mag - b.mag).slice(0, 5),
    nearest: [...stars].sort((a, b) => a.dist - b.dist).slice(0, 5)
  };

  // Count stars per constellation
  stars.forEach(star => {
    const con = star.con.toUpperCase();
    stats.constellations[con] = (stats.constellations[con] || 0) + 1;
  });

  return stats;
}

/**
 * Validate star catalog file
 */
function validateStarCatalog(filePath) {
  console.log(`Validating star catalog: ${filePath}\n`);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Read and parse JSON
  let stars;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    stars = JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err.message}`);
  }

  // Check it's an array
  if (!Array.isArray(stars)) {
    throw new Error('Star catalog must be an array');
  }

  if (stars.length === 0) {
    console.warn('⚠ Warning: Star catalog is empty');
    return { valid: true, errors: [], warnings: ['Empty catalog'] };
  }

  // Validate each star
  const allErrors = [];
  const allWarnings = [];

  stars.forEach((star, index) => {
    const errors = validateStar(star, index);
    if (errors.length > 0) {
      allErrors.push({
        index,
        hip: star.hip,
        name: star.name,
        errors
      });
    }
  });

  // Generate statistics
  const stats = generateStats(stars);

  // Report results
  console.log('='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60));
  console.log(`Total stars: ${stats.count}`);
  console.log(`Errors found: ${allErrors.length}`);
  console.log(`Warnings: ${allWarnings.length}`);
  console.log('');

  if (allErrors.length > 0) {
    console.log('ERRORS:');
    const errorsToShow = Math.min(allErrors.length, 10);
    allErrors.slice(0, errorsToShow).forEach(err => {
      console.log(`\n  Star #${err.index} (HIP ${err.hip} - ${err.name}):`);
      err.errors.forEach(e => console.log(`    - ${e}`));
    });

    if (allErrors.length > 10) {
      console.log(`\n  ... and ${allErrors.length - 10} more errors`);
    }
    console.log('');
  }

  if (allWarnings.length > 0) {
    console.log('WARNINGS:');
    allWarnings.forEach(w => console.log(`  - ${w}`));
    console.log('');
  }

  // Statistics
  console.log('='.repeat(60));
  console.log('CATALOG STATISTICS');
  console.log('='.repeat(60));
  console.log(`\nMagnitude Range:`);
  console.log(`  Min: ${stats.magnitude.min.toFixed(2)} (brightest)`);
  console.log(`  Max: ${stats.magnitude.max.toFixed(2)} (faintest)`);
  console.log(`  Avg: ${stats.magnitude.avg.toFixed(2)}`);

  console.log(`\nDistance Range (light-years):`);
  console.log(`  Min: ${stats.distance.min.toFixed(2)}`);
  console.log(`  Max: ${stats.distance.max.toFixed(2)}`);
  console.log(`  Avg: ${stats.distance.avg.toFixed(2)}`);

  console.log(`\nConstellations: ${Object.keys(stats.constellations).length} different`);
  const topConstellations = Object.entries(stats.constellations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  console.log(`  Top 5:`);
  topConstellations.forEach(([con, count]) => {
    console.log(`    ${con}: ${count} stars`);
  });

  console.log(`\nBrightest Stars:`);
  stats.brightest.forEach((star, i) => {
    console.log(`  ${i + 1}. ${star.name} (${star.con}) - mag ${star.mag.toFixed(2)}`);
  });

  console.log(`\nNearest Stars:`);
  stats.nearest.forEach((star, i) => {
    console.log(`  ${i + 1}. ${star.name} (${star.con}) - ${star.dist.toFixed(2)} ly`);
  });

  console.log('\n' + '='.repeat(60));

  // Final verdict
  const valid = allErrors.length === 0;
  if (valid) {
    console.log('✓ VALIDATION PASSED');
  } else {
    console.log(`✗ VALIDATION FAILED (${allErrors.length} errors)`);
  }
  console.log('='.repeat(60) + '\n');

  return { valid, errors: allErrors, warnings: allWarnings, stats };
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const defaultFile = path.resolve(process.cwd(), 'src/data/stars.json');
  const filePath = args[0] ? path.resolve(args[0]) : defaultFile;

  try {
    const result = validateStarCatalog(filePath);
    process.exit(result.valid ? 0 : 1);
  } catch (err) {
    console.error(`\n✗ Error: ${err.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateStarCatalog, validateStar, generateStats };
