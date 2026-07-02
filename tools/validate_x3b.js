const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const PART7_CATEGORIES = ['主旨', '細節', '推論', '跨篇比對', '字義'];

function validateSingle() {
  const file = path.join(DATA_DIR, 'reading_part7_single_T730_ext1.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = [];

  if (!Array.isArray(data)) errors.push('Not an array');
  if (data.length !== 18) errors.push(`Expected 18 groups, got ${data.length}`);

  const ids = new Set();
  let totalQ = 0;

  for (const g of data) {
    if (!g.id || !g.id.startsWith('P7S-T730-0')) errors.push(`Bad group id: ${g.id}`);
    if (ids.has(g.id)) errors.push(`Duplicate group id: ${g.id}`);
    ids.add(g.id);

    if (g.part !== 7) errors.push(`${g.id}: part !== 7`);
    if (g.type !== 'single') errors.push(`${g.id}: type !== single`);
    if (g.track !== 'T730') errors.push(`${g.id}: track !== T730`);

    if (!g.documents || g.documents.length !== 1) errors.push(`${g.id}: need 1 document`);

    const qs = g.questions;
    if (!qs || qs.length < 2 || qs.length > 4) errors.push(`${g.id}: questions count ${qs?.length}`);

    for (const q of qs) {
      totalQ++;
      if (!q.category || !PART7_CATEGORIES.includes(q.category)) {
        errors.push(`${q.id}: bad category "${q.category}"`);
      }
      if (q.crossReference !== false) errors.push(`${q.id}: crossReference should be false`);

      if (!q.options.includes(q.answer)) {
        errors.push(`${q.id}: answer "${q.answer}" not in options [${q.options.join(' | ')}]`);
      }
      if (q.options.length !== 4) errors.push(`${q.id}: need 4 options, got ${q.options.length}`);
    }
  }

  // Check id range
  for (let i = 7; i <= 24; i++) {
    const expected = `P7S-T730-${String(i).padStart(3, '0')}`;
    if (!ids.has(expected)) errors.push(`Missing expected id: ${expected}`);
  }

  const cats = {};
  for (const g of data) for (const q of g.questions) {
    cats[q.category] = (cats[q.category] || 0) + 1;
  }

  console.log(`=== SINGLE ===`);
  console.log(`Groups: ${data.length}, Questions: ${totalQ}`);
  console.log(`Categories:`, JSON.stringify(cats));
  console.log(`ID range: P7S-T730-007 to P7S-T730-024`);
  if (errors.length > 0) console.log(`ERRORS:\n${errors.join('\n')}`);
  else console.log(`VALIDATION PASSED`);
  return { errors, totalQ, cats };
}

function validateDouble() {
  const file = path.join(DATA_DIR, 'reading_part7_double_T730_ext1.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = [];

  if (!Array.isArray(data)) errors.push('Not an array');
  if (data.length !== 12) errors.push(`Expected 12 groups, got ${data.length}`);

  const ids = new Set();
  let totalQ = 0;
  let crossRefCounts = {};

  for (const g of data) {
    if (!g.id || !g.id.startsWith('P7D-T730-0')) errors.push(`Bad group id: ${g.id}`);
    if (ids.has(g.id)) errors.push(`Duplicate group id: ${g.id}`);
    ids.add(g.id);

    if (g.part !== 7) errors.push(`${g.id}: part !== 7`);
    if (g.type !== 'double') errors.push(`${g.id}: type !== double`);
    if (g.track !== 'T730') errors.push(`${g.id}: track !== T730`);

    if (!g.documents || g.documents.length !== 2) errors.push(`${g.id}: need 2 documents`);

    const qs = g.questions;
    if (!qs || qs.length !== 5) errors.push(`${g.id}: need 5 questions, got ${qs?.length}`);

    let crossRefInGroup = 0;
    for (const q of qs) {
      totalQ++;
      if (!q.category || !PART7_CATEGORIES.includes(q.category)) {
        errors.push(`${q.id}: bad category "${q.category}"`);
      }
      if (q.crossReference === true) crossRefInGroup++;

      if (!q.options.includes(q.answer)) {
        errors.push(`${q.id}: answer "${q.answer}" not in options [${q.options.join(' | ')}]`);
      }
      if (q.options.length !== 4) errors.push(`${q.id}: need 4 options, got ${q.options.length}`);
    }

    crossRefCounts[g.id] = crossRefInGroup;
    if (crossRefInGroup < 1) errors.push(`${g.id}: needs at least 1 crossReference`);
  }

  for (let i = 5; i <= 16; i++) {
    const expected = `P7D-T730-${String(i).padStart(3, '0')}`;
    if (!ids.has(expected)) errors.push(`Missing expected id: ${expected}`);
  }

  const cats = {};
  for (const g of data) for (const q of g.questions) {
    cats[q.category] = (cats[q.category] || 0) + 1;
  }

  console.log(`\n=== DOUBLE ===`);
  console.log(`Groups: ${data.length}, Questions: ${totalQ}`);
  console.log(`Categories:`, JSON.stringify(cats));
  console.log(`Cross references per group:`, JSON.stringify(crossRefCounts));
  console.log(`ID range: P7D-T730-005 to P7D-T730-016`);
  if (errors.length > 0) console.log(`ERRORS:\n${errors.join('\n')}`);
  else console.log(`VALIDATION PASSED`);
  return { errors, totalQ, cats };
}

function validateTriple() {
  const file = path.join(DATA_DIR, 'reading_part7_triple_T730_ext1.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = [];

  if (!Array.isArray(data)) errors.push('Not an array');
  if (data.length !== 9) errors.push(`Expected 9 groups, got ${data.length}`);

  const ids = new Set();
  let totalQ = 0;
  let crossRefCounts = {};

  for (const g of data) {
    if (!g.id || !g.id.startsWith('P7T-T730-0')) errors.push(`Bad group id: ${g.id}`);
    if (ids.has(g.id)) errors.push(`Duplicate group id: ${g.id}`);
    ids.add(g.id);

    if (g.part !== 7) errors.push(`${g.id}: part !== 7`);
    if (g.type !== 'triple') errors.push(`${g.id}: type !== triple`);
    if (g.track !== 'T730') errors.push(`${g.id}: track !== T730`);

    if (!g.documents || g.documents.length !== 3) errors.push(`${g.id}: need 3 documents`);

    const qs = g.questions;
    if (!qs || qs.length !== 5) errors.push(`${g.id}: need 5 questions, got ${qs?.length}`);

    let crossRefInGroup = 0;
    for (const q of qs) {
      totalQ++;
      if (!q.category || !PART7_CATEGORIES.includes(q.category)) {
        errors.push(`${q.id}: bad category "${q.category}"`);
      }
      if (q.crossReference === true) crossRefInGroup++;

      if (!q.options.includes(q.answer)) {
        errors.push(`${q.id}: answer "${q.answer}" not in options [${q.options.join(' | ')}]`);
      }
      if (q.options.length !== 4) errors.push(`${q.id}: need 4 options, got ${q.options.length}`);
    }

    crossRefCounts[g.id] = crossRefInGroup;
    if (crossRefInGroup < 1) errors.push(`${g.id}: needs at least 1 crossReference`);
  }

  for (let i = 4; i <= 12; i++) {
    const expected = `P7T-T730-${String(i).padStart(3, '0')}`;
    if (!ids.has(expected)) errors.push(`Missing expected id: ${expected}`);
  }

  const cats = {};
  for (const g of data) for (const q of g.questions) {
    cats[q.category] = (cats[q.category] || 0) + 1;
  }

  console.log(`\n=== TRIPLE ===`);
  console.log(`Groups: ${data.length}, Questions: ${totalQ}`);
  console.log(`Categories:`, JSON.stringify(cats));
  console.log(`Cross references per group:`, JSON.stringify(crossRefCounts));
  console.log(`ID range: P7T-T730-004 to P7T-T730-012`);
  if (errors.length > 0) console.log(`ERRORS:\n${errors.join('\n')}`);
  else console.log(`VALIDATION PASSED`);
  return { errors, totalQ, cats };
}

const s = validateSingle();
const d = validateDouble();
const t = validateTriple();

const allErrors = [...s.errors, ...d.errors, ...t.errors];
console.log(`\n=== SUMMARY ===`);
console.log(`Single: ${s.totalQ} questions, ${s.errors.length} errors`);
console.log(`Double: ${d.totalQ} questions, ${d.errors.length} errors`);
console.log(`Triple: ${t.totalQ} questions, ${t.errors.length} errors`);
console.log(`Total questions: ${s.totalQ + d.totalQ + t.totalQ}`);
console.log(`Total errors: ${allErrors.length}`);

if (allErrors.length > 0) {
  process.exit(1);
} else {
  console.log(`\nALL VALIDATIONS PASSED`);
}
