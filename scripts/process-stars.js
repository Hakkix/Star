#!/usr/bin/env node

/**
 * Star Catalog Processing Script
 *
 * This script processes raw star catalog data (CSV/TSV format) into the JSON format
 * required by the Star AR application.
 *
 * Usage:
 *   node scripts/process-stars.js <input-file> [output-file]
 *
 * Input Format (CSV/TSV):
 *   Should contain columns: HIP, RA, DEC, MAG, CON, DIST, NAME (or similar)
 *   Example: 677,0.1396,29.0906,2.06,AND,97.2,Alpheratz
 *
 * Output Format (JSON):
 *   [{ "hip": 677, "ra": 0.1396, "dec": 29.0906, "mag": 2.06, "con": "AND", "dist": 97.2, "name": "Alpheratz" }]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Filter stars by magnitude (lower = brighter)
  maxMagnitude: 6.5,

  // Expected columns in input file
  columns: {
    hip: 'HIP',
    ra: 'RA',
    dec: 'DEC',
    mag: 'MAG',
    con: 'CON',
    dist: 'DIST',
    name: 'NAME'
  },

  // Valid IAU constellation codes (3-letter)
  validConstellations: new Set([
    'AND', 'ANT', 'APS', 'AQR', 'AQL', 'ARA', 'ARI', 'AUR', 'BOO', 'CAE',
    'CAM', 'CNC', 'CVN', 'CMA', 'CMI', 'CAP', 'CAR', 'CAS', 'CEN', 'CEP',
    'CET', 'CHA', 'CIR', 'COL', 'COM', 'CRA', 'CRB', 'CRV', 'CRT', 'CRU',
    'CYG', 'DEL', 'DOR', 'DRA', 'EQU', 'ERI', 'FOR', 'GEM', 'GRU', 'HER',
    'HOR', 'HYA', 'HYI', 'IND', 'LAC', 'LEO', 'LMI', 'LEP', 'LIB', 'LUP',
    'LYN', 'LYR', 'MEN', 'MIC', 'MON', 'MUS', 'NOR', 'OCT', 'OPH', 'ORI',
    'PAV', 'PEG', 'PER', 'PHE', 'PIC', 'PSC', 'PSA', 'PUP', 'PYX', 'RET',
    'SGE', 'SGR', 'SCO', 'SCL', 'SCT', 'SER', 'SEX', 'TAU', 'TEL', 'TRI',
    'TRA', 'TUC', 'UMA', 'UMI', 'VEL', 'VIR', 'VOL', 'VUL'
  ])
};

/**
 * Parse CSV/TSV line into object
 */
function parseLine(line, delimiter = ',', headerMap) {
  const values = line.split(delimiter).map(v => v.trim());
  const obj = {};

  Object.keys(headerMap).forEach((key, idx) => {
    if (values[idx] !== undefined && values[idx] !== '') {
      obj[key] = values[idx];
    }
  });

  return obj;
}

/**
 * Validate star data
 */
function validateStar(star) {
  const errors = [];

  // Check required fields
  if (!star.hip || isNaN(parseInt(star.hip))) {
    errors.push('Invalid or missing HIP ID');
  }

  // Validate RA (0-24 hours)
  const ra = parseFloat(star.ra);
  if (isNaN(ra) || ra < 0 || ra >= 24) {
    errors.push(`Invalid RA: ${star.ra} (must be 0-24 hours)`);
  }

  // Validate Dec (-90 to +90 degrees)
  const dec = parseFloat(star.dec);
  if (isNaN(dec) || dec < -90 || dec > 90) {
    errors.push(`Invalid Dec: ${star.dec} (must be -90 to +90 degrees)`);
  }

  // Validate magnitude
  const mag = parseFloat(star.mag);
  if (isNaN(mag)) {
    errors.push(`Invalid magnitude: ${star.mag}`);
  }

  // Validate constellation code
  if (star.con && !CONFIG.validConstellations.has(star.con.toUpperCase())) {
    errors.push(`Invalid constellation code: ${star.con}`);
  }

  // Validate distance (optional but should be positive)
  if (star.dist !== undefined) {
    const dist = parseFloat(star.dist);
    if (isNaN(dist) || dist <= 0) {
      errors.push(`Invalid distance: ${star.dist}`);
    }
  }

  return errors;
}

/**
 * Convert raw star data to application format
 */
function convertStar(raw) {
  return {
    hip: parseInt(raw.hip),
    ra: parseFloat(raw.ra),
    dec: parseFloat(raw.dec),
    mag: parseFloat(raw.mag),
    con: raw.con ? raw.con.toUpperCase() : 'UNK',
    dist: raw.dist ? parseFloat(raw.dist) : 0,
    name: raw.name || `HIP ${raw.hip}`
  };
}

/**
 * Process star catalog file
 */
function processStarCatalog(inputFile, outputFile) {
  console.log(`Processing star catalog: ${inputFile}`);

  // Read input file
  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    throw new Error('Input file is empty');
  }

  // Detect delimiter (comma or tab)
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  console.log(`Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`);

  // Parse header
  const header = lines[0].split(delimiter).map(h => h.trim().toUpperCase());
  const headerMap = {};
  header.forEach((col, idx) => {
    // Map header columns to our expected fields
    if (col.includes('HIP')) headerMap[idx] = 'hip';
    else if (col.includes('RA')) headerMap[idx] = 'ra';
    else if (col.includes('DEC')) headerMap[idx] = 'dec';
    else if (col.includes('MAG')) headerMap[idx] = 'mag';
    else if (col.includes('CON')) headerMap[idx] = 'con';
    else if (col.includes('DIST')) headerMap[idx] = 'dist';
    else if (col.includes('NAME')) headerMap[idx] = 'name';
  });

  console.log(`Found columns: ${Object.values(headerMap).join(', ')}`);

  // Process data lines
  const stars = [];
  const errors = [];
  let filtered = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const raw = parseLine(lines[i], delimiter, headerMap);

      // Filter by magnitude
      if (raw.mag && parseFloat(raw.mag) > CONFIG.maxMagnitude) {
        filtered++;
        continue;
      }

      // Validate
      const validationErrors = validateStar(raw);
      if (validationErrors.length > 0) {
        errors.push({ line: i + 1, errors: validationErrors, data: raw });
        continue;
      }

      // Convert and add
      stars.push(convertStar(raw));
    } catch (err) {
      errors.push({ line: i + 1, errors: [err.message], data: lines[i] });
    }
  }

  // Report
  console.log(`\nProcessing complete:`);
  console.log(`  Total lines: ${lines.length - 1}`);
  console.log(`  Valid stars: ${stars.length}`);
  console.log(`  Filtered (mag > ${CONFIG.maxMagnitude}): ${filtered}`);
  console.log(`  Errors: ${errors.length}`);

  if (errors.length > 0 && errors.length < 10) {
    console.log(`\nFirst ${errors.length} errors:`);
    errors.forEach(err => {
      console.log(`  Line ${err.line}: ${err.errors.join(', ')}`);
    });
  } else if (errors.length >= 10) {
    console.log(`\nFirst 10 errors:`);
    errors.slice(0, 10).forEach(err => {
      console.log(`  Line ${err.line}: ${err.errors.join(', ')}`);
    });
  }

  // Sort by magnitude (brightest first)
  stars.sort((a, b) => a.mag - b.mag);

  // Write output
  fs.writeFileSync(outputFile, JSON.stringify(stars, null, 2));
  console.log(`\nOutput written to: ${outputFile}`);
  console.log(`File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);

  // Statistics
  const magStats = {
    min: Math.min(...stars.map(s => s.mag)),
    max: Math.max(...stars.map(s => s.mag)),
    avg: stars.reduce((sum, s) => sum + s.mag, 0) / stars.length
  };

  console.log(`\nMagnitude distribution:`);
  console.log(`  Min: ${magStats.min.toFixed(2)}`);
  console.log(`  Max: ${magStats.max.toFixed(2)}`);
  console.log(`  Avg: ${magStats.avg.toFixed(2)}`);

  return { stars, errors };
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node process-stars.js <input-file> [output-file]');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/process-stars.js hipparcos.csv src/data/stars.json');
    console.log('');
    console.log('Input file should be CSV/TSV with columns: HIP, RA, DEC, MAG, CON, DIST, NAME');
    console.log('');
    console.log('Configuration:');
    console.log(`  Max magnitude: ${CONFIG.maxMagnitude} (naked eye visibility)`);
    process.exit(1);
  }

  const inputFile = path.resolve(args[0]);
  const outputFile = args[1] ? path.resolve(args[1]) : path.join(process.cwd(), 'src/data/stars.json');

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  try {
    processStarCatalog(inputFile, outputFile);
    console.log('\n✓ Processing complete!');
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processStarCatalog, validateStar, convertStar };
