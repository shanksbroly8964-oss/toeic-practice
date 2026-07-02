// Deep Analysis: T600 vs T730 difficulty + vocab analysis
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const findings = [];

function readJSON(fname) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, fname), 'utf8'));
}

// Compare Part5 T600 vs T730
const p5t600 = readJSON('reading_part5_T600.json');
const p5t730 = readJSON('reading_part5_T730.json');

// Simple vocabulary complexity: count word length, unique words
function getWordComplexity(text) {
  const words = text.replace(/[^\w\s']/g, '').split(/\s+/).filter(w => w.length > 0);
  const avgLen = words.reduce((s, w) => s + w.length, 0) / words.length;
  // Count advanced words (length > 7 chars)
  const advanced = words.filter(w => w.length > 7).length;
  return { total: words.length, avgLen: avgLen.toFixed(2), advanced };
}

// Analyze questions text complexity
let t600QuestionWords = [], t730QuestionWords = [];
let t600Advanced = 0, t730Advanced = 0;
let t600Total = 0, t730Total = 0;

p5t600.forEach(item => {
  const c = getWordComplexity(item.question);
  t600QuestionWords.push(c.avgLen);
  t600Advanced += c.advanced;
  t600Total += c.total;
});

p5t730.forEach(item => {
  const c = getWordComplexity(item.question);
  t730QuestionWords.push(c.avgLen);
  t730Advanced += c.advanced;
  t730Total += c.total;
});

const t600AvgQ = (t600QuestionWords.reduce((a,b) => a + parseFloat(b), 0) / t600QuestionWords.length).toFixed(2);
const t730AvgQ = (t730QuestionWords.reduce((a,b) => a + parseFloat(b), 0) / t730QuestionWords.length).toFixed(2);

console.log('=== Part5 Questionnaire Complexity ===');
console.log(`T600: avg word len=${t600AvgQ}, advanced ratio=${(t600Advanced/t600Total*100).toFixed(1)}%`);
console.log(`T730: avg word len=${t730AvgQ}, advanced ratio=${(t730Advanced/t730Total*100).toFixed(1)}%`);

// Option difficulty: how similar are distractors to the answer?
function analyzeOptionDifficulty(item) {
  const ans = item.answer;
  const others = item.options.filter(o => o !== ans);
  // Check if any distractor is same word class or has same prefix
  let trickyCount = 0;
  others.forEach(o => {
    // Same length or starts with same letter = more confusing
    if (o.length === ans.length) trickyCount++;
    if (o[0] === ans[0]) trickyCount++;
    // Is it a valid word that fits in the sentence? (heuristic)
    if (o.length > 3 && o.length < 12) trickyCount++;
  });
  return trickyCount;
}

// Compare distractor trickiness
const t600Tricky = p5t600.map(analyzeOptionDifficulty);
const t730Tricky = p5t730.map(analyzeOptionDifficulty);
const t600AvgTricky = (t600Tricky.reduce((a,b)=>a+b,0)/t600Tricky.length).toFixed(2);
const t730AvgTricky = (t730Tricky.reduce((a,b)=>a+b,0)/t730Tricky.length).toFixed(2);
console.log(`\n=== Part5 Distractor Trickiness ===`);
console.log(`T600: avg trickiness=${t600AvgTricky}`);
console.log(`T730: avg trickiness=${t730AvgTricky}`);

// Check for T730 items that are too similar to T600 (easy vocab)
const easyWords = ['make', 'take', 'do', 'have', 'sign', 'submit', 'attend', 'order', 'fast', 'easy'];
let tooEasy = [];
p5t730.forEach((item, i) => {
  const words = item.question.replace(/[^\w\s']/g, '').toLowerCase().split(/\s+/);
  const easyCount = words.filter(w => easyWords.includes(w)).length;
  if (easyCount >= 3 && words.length < 12) {
    tooEasy.push({ id: item.id, question: item.question.substring(0, 80), easyCount });
  }
});

console.log(`\n=== T730 Part5 items that seem too easy (≥3 basic words in short question) ===`);
tooEasy.forEach(item => console.log(`  ${item.id}: "${item.question}"`));

// Also check Part6 complexity
const p6t600 = readJSON('reading_part6_T600.json');
const p6t730 = readJSON('reading_part6_T730.json');

function textComplexityScore(text) {
  const sentences = text.split(/[.?!]/).filter(s => s.trim().length > 0);
  const avgSentLen = sentences.reduce((s, sent) => s + sent.split(/\s+/).length, 0) / Math.max(1, sentences.length);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(1, words.length);
  return { avgSentLen: avgSentLen.toFixed(1), avgWordLen: avgWordLen.toFixed(2), sentences: sentences.length };
}

console.log(`\n=== Part6 Passage Complexity ===`);
p6t600.forEach(item => {
  const c = textComplexityScore(item.passageTemplate);
  console.log(`  T600 ${item.id}: sentences=${c.sentences}, avgSentLen=${c.avgSentLen}, avgWordLen=${c.avgWordLen}`);
});
p6t730.forEach(item => {
  const c = textComplexityScore(item.passageTemplate);
  console.log(`  T730 ${item.id}: sentences=${c.sentences}, avgSentLen=${c.avgSentLen}, avgWordLen=${c.avgWordLen}`);
});

// Identify items where T730 blank options might have letter answers or other issues
// (We already validated, but double-check for edge cases)

console.log('\n=== Potential Issues from Deep Analysis ===');
if (tooEasy.length > 0) {
  console.log(`Found ${tooEasy.length} T730 Part5 items that seem too easy. May need rewriting.`);
}

// Check Part6 for complex business vocabulary usage
console.log('\n=== Part6 Vocabulary Depth ===');
const t600Vocab = new Set();
const t730Vocab = new Set();
p6t600.forEach(item => {
  item.passageTemplate.split(/\W+/).forEach(w => { if (w.length > 5) t600Vocab.add(w.toLowerCase()); });
});
p6t730.forEach(item => {
  item.passageTemplate.split(/\W+/).forEach(w => { if (w.length > 5) t730Vocab.add(w.toLowerCase()); });
});

const t730Unique = [...t730Vocab].filter(w => !t600Vocab.has(w)).slice(0, 30);
console.log(`T600 long words: ${t600Vocab.size}, T730 long words: ${t730Vocab.size}`);
console.log(`T730 unique advanced vocabulary (sample): ${t730Unique.join(', ')}`);
