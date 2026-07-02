// QA3: Validate all 18 data JSONs — syntax + deep check answer ∈ options
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json")).sort();
let errors = [];

function checkQuestion(file, q, location) {
  if (!q.answer) { errors.push(`${file}: ${location} missing "answer"`); return; }
  if (!Array.isArray(q.options)) { errors.push(`${file}: ${location} missing "options" array`); return; }
  if (!q.options.includes(q.answer)) {
    errors.push(`${file}: ${location} answer "${q.answer}" NOT in options [${q.options.join(", ")}]`);
  }
}

for (const file of files) {
  const filePath = path.join(dataDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    errors.push(`${file}: INVALID JSON → ${e.message}`);
    continue;
  }
  if (!Array.isArray(data) || data.length === 0) {
    errors.push(`${file}: root is not a non-empty array`);
    continue;
  }

  const isListeningPN = file.startsWith("listening_part3") || file.startsWith("listening_part4");
  const isPart6 = file.startsWith("reading_part6");
  const isPart7 = file.startsWith("reading_part7");

  if (isListeningPN || isPart7) {
    // Top-level items have nested "questions" arrays
    let totalSubQ = 0;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.questions || !Array.isArray(item.questions)) {
        errors.push(`${file}: item[${i}] missing "questions" array`);
        continue;
      }
      for (let j = 0; j < item.questions.length; j++) {
        totalSubQ++;
        checkQuestion(file, item.questions[j], `item[${i}].questions[${j}] (id: ${item.questions[j].id || "?"})`);
      }
    }
    // Spot-check first and last sub-question
    const firstItem = data[0];
    const lastItem = data[data.length - 1];
    if (firstItem.questions && firstItem.questions.length > 0)
      checkQuestion(file, firstItem.questions[0], "FIRST sub-question");
    if (lastItem.questions && lastItem.questions.length > 0)
      checkQuestion(file, lastItem.questions[lastItem.questions.length - 1], "LAST sub-question");
    console.log(`  ${file}: ${data.length} items, ${totalSubQ} sub-questions`);
  } else if (isPart6) {
    let totalBlanks = 0;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.blanks || !Array.isArray(item.blanks)) {
        errors.push(`${file}: item[${i}] missing "blanks" array`);
        continue;
      }
      for (let j = 0; j < item.blanks.length; j++) {
        totalBlanks++;
        checkQuestion(file, item.blanks[j], `item[${i}].blanks[${j}] (id: ${item.blanks[j].id || item.id + "-blank-" + item.blanks[j].index})`);
      }
    }
    const first = data[0];
    const last = data[data.length - 1];
    if (first.blanks && first.blanks.length > 0) checkQuestion(file, first.blanks[0], "FIRST blank");
    if (last.blanks && last.blanks.length > 0) checkQuestion(file, last.blanks[last.blanks.length - 1], "LAST blank");
    console.log(`  ${file}: ${data.length} passages, ${totalBlanks} blanks`);
  } else {
    // Flat arrays: Listening Part1/2, Reading Part5
    for (let i = 0; i < data.length; i++) {
      checkQuestion(file, data[i], `item[${i}] (id: ${data[i].id || "?"})`);
    }
    checkQuestion(file, data[0], "FIRST item");
    checkQuestion(file, data[data.length - 1], "LAST item");
    console.log(`  ${file}: ${data.length} items`);
  }
}

console.log(`\n=== QA3 JSON Validation: ${files.length} files ===`);
if (errors.length === 0) {
  console.log("ALL PASSED. No issues found.");
} else {
  console.log(`FAILURES: ${errors.length}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
}

process.exit(errors.length > 0 ? 1 : 0);
