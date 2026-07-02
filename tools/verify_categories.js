// verify_categories.js v2 - Part-aware comparison
// Strips all "category" from current, then deep-compares with backup.
// Also counts expected category locations by part.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const BACKUP_DIR = path.join(DATA_DIR, '_backup_pre_category');

const files = [
  'listening_part1_T600.json','listening_part1_T730.json',
  'listening_part2_T600.json','listening_part2_T730.json',
  'listening_part3_T600.json','listening_part3_T730.json',
  'listening_part4_T600.json','listening_part4_T730.json',
  'reading_part5_T600.json','reading_part5_T730.json',
  'reading_part6_T600.json','reading_part6_T730.json',
  'reading_part7_single_T600.json','reading_part7_single_T730.json',
  'reading_part7_double_T600.json','reading_part7_double_T730.json',
  'reading_part7_triple_T600.json','reading_part7_triple_T730.json',
];

const P1_CATS = ['人物動作', '物品狀態', '場景位置'];
const P2_CATS = ['WH問句', 'YesNo問句', '附加間接問句', '陳述句回應', '音似干擾'];
const P3_CATS = ['主旨', '細節', '推論意圖', '圖表整合'];
const P4_CATS = ['主旨', '細節', '推論', '數字時間'];
const P5_CATS = ['時態', '詞性', '介系詞', '連接詞', '關係代名詞', '假設語氣', '搭配詞', '片語動詞', '近義字彙'];
const P6_CATS = ['時態', '詞性', '介系詞', '連接詞', '關係代名詞', '假設語氣', '搭配詞', '片語動詞', '近義字彙', '句子插入', '上下文邏輯'];
const P7_CATS = ['主旨', '細節', '推論', '跨篇比對', '字義'];

const VALID_CATS = {
  1: P1_CATS, 2: P2_CATS, 3: P3_CATS, 4: P4_CATS, 5: P5_CATS, 6: P6_CATS, 7: P7_CATS,
};

// Strip all "category" keys recursively
function stripCategory(obj) {
  if (Array.isArray(obj)) return obj.map(stripCategory);
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k !== 'category') result[k] = stripCategory(v);
    }
    return result;
  }
  return obj;
}

// Count category placements per part
function countAndValidateCategories(data, partNum) {
  let total = 0;
  let invalid = [];
  const validSet = VALID_CATS[partNum] || [];

  if (partNum === 1 || partNum === 2 || partNum === 5) {
    for (const item of data) {
      if (!item.category) invalid.push({ id: item.id, reason: 'missing category' });
      else if (!validSet.includes(item.category)) invalid.push({ id: item.id, cat: item.category, reason: 'invalid category' });
      total++;
    }
  } else if (partNum === 3 || partNum === 4 || partNum === 7) {
    for (const item of data) {
      if (!Array.isArray(item.questions)) continue;
      for (const q of item.questions) {
        if (!q.category) invalid.push({ id: q.id || '?', reason: 'missing category' });
        else if (!validSet.includes(q.category)) invalid.push({ id: q.id || '?', cat: q.category, reason: 'invalid category' });
        total++;
      }
    }
  } else if (partNum === 6) {
    for (const item of data) {
      if (!Array.isArray(item.blanks)) continue;
      for (const b of item.blanks) {
        if (!b.category) invalid.push({ id: item.id + '-B' + b.index, reason: 'missing category' });
        else if (!validSet.includes(b.category)) invalid.push({ id: item.id + '-B' + b.index, cat: b.category, reason: 'invalid category' });
        total++;
      }
    }
  }
  return { total, invalid };
}

let passCount = 0;
let failCount = 0;
let grandTotal = 0;
let allInvalid = [];
const perFileResults = [];

console.log('=== CATEGORY VERIFICATION V2 ===\n');

for (const file of files) {
  const backupPath = path.join(BACKUP_DIR, file);
  const currentPath = path.join(DATA_DIR, file);

  console.log(`\n${file}`);

  let backupData, currentData;
  try {
    backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    currentData = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
  } catch (e) {
    console.log(`  FAIL: JSON parse error: ${e.message}`);
    failCount++;
    continue;
  }

  // Determine part number
  let partNum = null;
  if (Array.isArray(currentData) && currentData.length > 0) {
    partNum = currentData[0].part;
  }
  if (partNum === null) {
    if (file.includes('part1')) partNum = 1;
    else if (file.includes('part2')) partNum = 2;
    else if (file.includes('part3')) partNum = 3;
    else if (file.includes('part4')) partNum = 4;
    else if (file.includes('part5')) partNum = 5;
    else if (file.includes('part6')) partNum = 6;
    else if (file.includes('part7')) partNum = 7;
  }

  // Strip category from current and compare with backup
  const strippedCurrent = stripCategory(currentData);
  const match = JSON.stringify(backupData) === JSON.stringify(strippedCurrent);

  // Validate categories
  const { total, invalid } = countAndValidateCategories(currentData, partNum);
  grandTotal += total;

  if (match && invalid.length === 0) {
    console.log(`  PASS: ${total} items tagged, all original fields preserved`);
    passCount++;
    perFileResults.push({ file, items: total, status: 'pass' });
  } else {
    console.log(`  FAIL:`);
    if (!match) console.log(`    Original field mismatch between backup and current`);
    if (invalid.length > 0) {
      console.log(`    ${invalid.length} invalid/missing categories:`);
      invalid.slice(0, 5).forEach(e => console.log(`      ${e.id}: ${e.reason}${e.cat ? ' (' + e.cat + ')' : ''}`));
      if (invalid.length > 5) console.log(`      ... and ${invalid.length - 5} more`);
    }
    failCount++;
    allInvalid = allInvalid.concat(invalid);
    perFileResults.push({ file, items: total, status: 'fail', invalid });
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`PASS: ${passCount}/${files.length}`);
console.log(`FAIL: ${failCount}/${files.length}`);
console.log(`Total items tagged: ${grandTotal}`);

fs.writeFileSync(
  path.join(DATA_DIR, '_verify_result.json'),
  JSON.stringify({ passCount, failCount, totalItems: grandTotal, perFile: perFileResults }, null, 2)
);

if (failCount === 0) {
  console.log(`\ndiff_check: PASS`);
} else {
  console.log(`\ndiff_check: FAIL`);
}
