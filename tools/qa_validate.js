// QA Validation Script — Wave 1
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const issues = [];
const stats = {};

function issue(file, msg) {
  issues.push({ file: path.basename(file), msg });
}

// 1. JSON validity check
function validateJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return { ok: true, data, raw };
  } catch (e) {
    issue(filePath, 'JSON parse error: ' + e.message);
    return { ok: false, data: null, raw: null };
  }
}

// 2. Answer convention checks
function checkAnswerConvention(filePath, data) {
  const fname = path.basename(filePath);
  if (!Array.isArray(data)) {
    issue(filePath, 'Root is not an array');
    return;
  }

  if (fname.startsWith('reading_part5')) {
    data.forEach((item, i) => {
      const opts = item.options;
      const ans = item.answer;
      if (!Array.isArray(opts) || opts.length !== 4) {
        issue(filePath, `Item ${i} (${item.id}): options is not an array of length 4`);
      }
      if (typeof ans !== 'string') {
        issue(filePath, `Item ${i} (${item.id}): answer is not a string, got ${typeof ans}: ${JSON.stringify(ans)}`);
      } else if (ans.length === 1 && ans >= 'A' && ans <= 'D') {
        issue(filePath, `Item ${i} (${item.id}): answer is a letter "${ans}" instead of full text`);
      } else if (opts && !opts.includes(ans)) {
        issue(filePath, `Item ${i} (${item.id}): answer "${ans}" not found in options: ${JSON.stringify(opts)}`);
      }
    });
  }

  if (fname.startsWith('reading_part6')) {
    data.forEach((item, i) => {
      const blanks = item.blanks;
      const template = item.passageTemplate;
      if (!Array.isArray(blanks) || blanks.length !== 4) {
        issue(filePath, `Item ${i} (${item.id}): blanks is not an array of length 4`);
      } else {
        blanks.forEach((b, bi) => {
          if (!b.index || b.index !== bi + 1) {
            issue(filePath, `Item ${i} (${item.id}): blank index expected ${bi+1} but got ${b.index}`);
          }
          if (typeof b.answer !== 'string') {
            issue(filePath, `Item ${i} (${item.id}) blank ${bi+1}: answer is not a string`);
          } else if (b.answer.length === 1 && b.answer >= 'A' && b.answer <= 'D') {
            issue(filePath, `Item ${i} (${item.id}) blank ${bi+1}: answer is a letter "${b.answer}" instead of full text`);
          } else if (b.options && !b.options.includes(b.answer)) {
            issue(filePath, `Item ${i} (${item.id}) blank ${bi+1}: answer "${b.answer}" not found in options: ${JSON.stringify(b.options)}`);
          }
          const marker = `(${b.index})___`;  // was (1)___ but let's check
          // Check passageTemplate has corresponding marker
          const markerPattern = new RegExp(`\\(${b.index}\\)\\s*_+`);
          if (template && !markerPattern.test(template)) {
            issue(filePath, `Item ${i} (${item.id}) blank ${b.index}: passageTemplate missing marker (${b.index})___`);
          }
        });
      }
    });
  }

  if (fname.startsWith('reading_part7')) {
    data.forEach((item, i) => {
      const questions = item.questions;
      const isDoubleTriple = fname.includes('_double_') || fname.includes('_triple_');
      if (!Array.isArray(questions) || questions.length === 0) {
        issue(filePath, `Item ${i} (${item.id}): questions is empty or not an array`);
      } else {
        let hasCrossRef = false;
        questions.forEach((q, qi) => {
          if (q.crossReference === true) hasCrossRef = true;
          if (typeof q.answer !== 'string') {
            issue(filePath, `Item ${i} (${item.id}) Q${qi+1}: answer is not a string`);
          } else if (q.answer.length === 1 && q.answer >= 'A' && q.answer <= 'D') {
            issue(filePath, `Item ${i} (${item.id}) Q${qi+1}: answer is a letter "${q.answer}" instead of full text`);
          } else if (q.options && !q.options.includes(q.answer)) {
            issue(filePath, `Item ${i} (${item.id}) Q${qi+1}: answer "${q.answer}" not found in options: ${JSON.stringify(q.options)}`);
          }
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            issue(filePath, `Item ${i} (${item.id}) Q${qi+1}: options is not an array of length 4`);
          }
        });
        if (isDoubleTriple && !hasCrossRef) {
          issue(filePath, `Item ${i} (${item.id}): double/triple passage has no crossReference:true question`);
        }
      }
    });
  }
}

// 3. ID uniqueness and format check
function checkIDs(filePath, data) {
  const fname = path.basename(filePath);
  let ids = [];
  let qIds = [];

  data.forEach((item, i) => {
    const id = item.id;
    if (!id) {
      issue(filePath, `Item ${i}: missing id`);
      return;
    }
    ids.push(id);

    // Check format
    const idPatterns = {
      'reading_part5': /^P5-(T600|T730)-\d{3}$/,
      'reading_part6': /^P6-(T600|T730)-\d{3}$/,
      'reading_part7_single': /^P7S-(T600|T730)-\d{3}$/,
      'reading_part7_double': /^P7D-(T600|T730)-\d{3}$/,
      'reading_part7_triple': /^P7T-(T600|T730)-\d{3}$/,
    };

    let matched = false;
    for (const [prefix, pattern] of Object.entries(idPatterns)) {
      if (fname.startsWith(prefix)) {
        if (!pattern.test(id)) {
          issue(filePath, `${id}: id format mismatch, expected pattern ${pattern}`);
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      issue(filePath, `${id}: could not determine expected format for filename ${fname}`);
    }

    // Collect question IDs for Part7
    if (fname.startsWith('reading_part7') && item.questions) {
      item.questions.forEach((q, qi) => {
        if (q.id) qIds.push(q.id);
        const expectedQId = `${id}-Q${qi+1}`;
        if (q.id !== expectedQId) {
          issue(filePath, `${q.id}: question ID mismatch, expected ${expectedQId}`);
        }
      });
    }
  });

  // Check uniqueness
  const idSet = new Set(ids);
  if (idSet.size !== ids.length) {
    const dupes = ids.filter((v, i, a) => a.indexOf(v) !== i);
    issue(filePath, `Duplicate IDs found: ${[...new Set(dupes)].join(', ')}`);
  }

  if (qIds.length > 0) {
    const qIdSet = new Set(qIds);
    if (qIdSet.size !== qIds.length) {
      const dupes = qIds.filter((v, i, a) => a.indexOf(v) !== i);
      issue(filePath, `Duplicate question IDs found: ${[...new Set(dupes)].join(', ')}`);
    }
  }
}

// 4. Count stats
function countStats(filePath, data) {
  const fname = path.basename(filePath);
  if (fname.startsWith('reading_part5')) {
    stats[fname] = { type: 'Part5', items: data.length };
  } else if (fname.startsWith('reading_part6')) {
    stats[fname] = { type: 'Part6', passsages: data.length, blanks: data.length * 4 };
  } else if (fname.startsWith('reading_part7')) {
    let totalQuestions = 0;
    data.forEach(item => { totalQuestions += (item.questions || []).length; });
    stats[fname] = { type: 'Part7', passsages: data.length, questions: totalQuestions };
  }
}

// Main
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();

files.forEach(f => {
  const fp = path.join(dataDir, f);
  const result = validateJSON(fp);
  if (result.ok) {
    checkAnswerConvention(fp, result.data);
    checkIDs(fp, result.data);
    countStats(fp, result.data);
  }
});

// Print results
console.log('=== QA Validation Results ===\n');
console.log('--- Issues Found ---\n');
if (issues.length === 0) {
  console.log('No issues found!');
} else {
  issues.forEach(({ file, msg }) => {
    console.log(`  [${file}] ${msg}`);
  });
}

console.log('\n--- File Stats ---\n');
for (const [f, s] of Object.entries(stats)) {
  console.log(`  ${f}: ${JSON.stringify(s)}`);
}

console.log(`\n=== Total Issues: ${issues.length} ===`);

// Write to file
fs.writeFileSync(path.join(__dirname, 'qa_results.json'), JSON.stringify({ issues, stats }, null, 2));
console.log('Results written to tools/qa_results.json');
