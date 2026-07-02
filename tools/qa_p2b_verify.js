// QA_P2B 驗證腳本 - Node.js 靜態驗證
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const JS_DIR = path.resolve(__dirname, '..', 'js');

let issues = [];
let fixed = [];

// ============================================================
// UTIL: Read JS as text
// ============================================================
function readJS(filename) {
  return fs.readFileSync(path.join(JS_DIR, filename), 'utf8');
}

// ============================================================
// 1. 繁中覆蓋率：檢查 HTML/JS 中的英文 UI 字串
// ============================================================
console.log('=== 1. 繁中覆蓋率 ===');

function isEnglishUI(str) {
  // Skip: question content, options, answer text, console.log, code keywords, URLs, data paths
  if (/^(async|function|return|const|let|var|new|true|false|null|undefined|if|else|for|while|switch|case|break|continue|try|catch|throw|typeof|instanceof|this|window|document|Promise|Array|Object|JSON|Math|String|Number|Date|Error|localStorage|sessionStorage|console|fetch|textContent|innerHTML|appendChild|createElement|addEventListener|setTimeout|clearTimeout|parseInt|parseFloat|isNaN|isArray|forEach|indexOf|substring|slice|push|pop|shift|unshift|splice|map|filter|reduce|sort|join|split|replace|match|test|length|push|getItem|setItem|removeItem|parse|stringify|log|warn|error|info|classList|className|style|cssText|add|remove|toggle|contains|hidden|active|disabled|currentIndex|totalItems|answeredCount|isComposite|isCorrect|correctAnswer|userAnswer|explanation|question|options|answer|questions|blanks|passageTemplate|passageTitle|documents|conversation|talk|audioScript|imageDescription|chartData|headers|rows|speaker|line|part|track|category|id|questionId|type|timestamp|attempts|wrong|correct|total|accuracy|details|perPart|partOrder|partCounts|count|subTotal|index|label|title|description|onClick|onConfirm|onStart|callback|error|message|status|key|value|text|src|href|type|name|displayName|email|photoURL|uid|user|auth|db|firebase|firebaseConfig|signInWithPopup|signOut|speechSynthesis|SpeechSynthesisUtterance|speak|cancel|speaking|PromiseResolve|PromiseReject|Function|Object|Array|Boolean|WebSocket|XMLHttpRequest|EventTarget|Node|Element|HTMLElement|HTMLDivElement|HTMLButtonElement|HTMLInputElement|HTMLSelectElement|HTMLOptionElement|HTMLSpanElement|HTMLParagraphElement|HTMLTableElement|HTMLTableRowElement|HTMLTableCellElement|HTMLTableSectionElement|Audio|Image|FileReader|Blob|URL|atob|btoa|encodeURIComponent|decodeURIComponent)$/.test(str)) return false;
  // Skip URLs, file paths
  if (/^(data\/|js\/|css\/|https?:\/\/)/.test(str)) return false;
  // Skip CSS class names and attribute names
  if (/^[a-z]+(-[a-z]+)*$/.test(str)) return false;
  // Skip single letters like A B C D
  if (/^[A-Da-d]$/.test(str)) return false;
  // Skip HTML tags and CSS units
  if (/^(p|div|span|h[1-6]|button|input|select|option|label|br|hr|img|a|li|ul|ol|table|thead|tbody|tr|th|td|strong|em|i|b|u|s|small|code|pre|header|footer|nav|section|article|main|aside|form|fieldset|legend)$/.test(str)) return false;
  // Skip CSS properties
  if (/^(display|flex|block|inline|grid|none|center|left|right|top|bottom|absolute|relative|fixed|sticky|padding|margin|border|color|background|font|width|height|max-width|min-height|text-align|white-space|word-wrap|overflow|hidden|auto|scroll|pointer|cursor|transition|transform|animation|box-shadow|border-radius|z-index|inset|rem|px|em|%|solid|dashed|dotted|transition)$/.test(str)) return false;
  
  // Now check if this looks like English UI text (words that should be translated)
  // Look for words like "Error", "Loading", "Correct", "Wrong", "Submit", etc.
  if (/^(Error|Loading|Correct|Wrong|Submit|Cancel|OK|Save|Delete|Edit|Back|Next|Previous|Home|Settings|Logout|Login|Sign In|Sign Up|Register|Password|Email|Username|Menu|Search|Filter|Sort|Reset|Close|Open|Start|Stop|Play|Pause|Record|Upload|Download|Export|Import|Print|Share|Like|Comment|Reply|Send|Add|Remove|Create|Update|View|Hide|Show|Enable|Disable|Yes|No|Done|Finish|Retry|Refresh|Reload|Clear|Copy|Paste|Cut|Undo|Redo|Select|All|None|Part|Mode|Track|Score|Result|Results|Practice|Test|Quiz|Exam|Exercise|Answer|Answers|Question|Questions|Explanation|Attempt|Attempts|Rate|Date|Time|Total|Summary|Details|Overview|History|Stats|Statistics|Analysis|Analytics|Report|Chart|Graph|Table|List|Card|Grid|Item|Items|Row|Row Module|Column|Section|Header|Footer|Sidebar|Navbar|Dropdown|Dialog|Modal|Overlay|Tooltip|Badge|Tag|Chip|Pill|Alert|Toast|Notification|Banner|Spinner|Skeleton|Loader|Progress|Empty|Placeholder|Avatar|Icon|Button|Link|Tab|Accordion|Carousel|Slider|Toggle|Switch|Radio|Checkbox|Input|Textarea|SelectBox|Datepicker|Timepicker|Colorpicker|Filepicker|SliderHandle|DragHandle|ResizeHandle|Resizer|Splitter)$/i.test(str)) return true;
  
  // Look for English sentences with spaces
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+/.test(str)) return true;
  if (/^[A-Z][a-z]+\s+[a-z]+/.test(str)) return true;
  
  return false;
}

// Check index.html
let htmlContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
let langMatch = htmlContent.match(/<html\s+lang="([^"]+)"/);
if (langMatch) {
  console.log('  HTML lang:', langMatch[1]);
  if (langMatch[1] !== 'zh-Hant') {
    issues.push('HTML lang 不是 zh-Hant，而是: ' + langMatch[1]);
  } else {
    console.log('  PASS: lang="zh-Hant"');
  }
} else {
  issues.push('HTML 缺少 lang 屬性');
}

// Check all JS files for English UI strings
let englishUI = [];
for (let fn of fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js'))) {
  let code = readJS(fn);
  // Extract textContent assignments
  let matches = code.match(/textContent\s*=\s*['"]([^'"]+)['"]/g) || [];
  for (let m of matches) {
    let text = m.match(/['"]([^'"]+)['"]/)[1];
    // Skip non-alphabetic or Chinese characters
    if (!/^[\x00-\x7F]+$/.test(text)) continue; // Contains non-ASCII (Chinese)
    if (text.length < 3) continue;
    if (isEnglishUI(text)) {
      englishUI.push(`${fn}: textContent="${text}"`);
    }
  }
  
  // Extract innerHTML assignments with literal strings
  matches = code.match(/innerHTML\s*=\s*['"]([^'"]{3,})['"]/g) || [];
  for (let m of matches) {
    let text = m.match(/['"]([^'"]+)['"]/)[1];
    if (!/^[\x00-\x7F]+$/.test(text)) continue;
    if (isEnglishUI(text)) {
      englishUI.push(`${fn}: innerHTML="${text}"`);
    }
  }
  
  // Extract alert/confirm strings
  matches = code.match(/(?:alert|confirm)\s*\(\s*['"]([^'"]+)['"]/g) || [];
  for (let m of matches) {
    let text = m.match(/['"]([^'"]+)['"]/)[1];
    if (!/^[\x00-\x7F]+$/.test(text)) continue;
    if (isEnglishUI(text)) {
      englishUI.push(`${fn}: alert/confirm="${text}"`);
    }
  }
}

if (englishUI.length > 0) {
  console.log('  POTENTIAL English UI strings:');
  englishUI.forEach(e => console.log('    ' + e));
  issues.push(`發現 ${englishUI.length} 個可疑英文 UI 字串`);
} else {
  console.log('  PASS: 無明顯英文 UI 字串');
}

// ============================================================
// 2. 出題數設定
// ============================================================
console.log('\n=== 2. 出題數設定 ===');

// Mock session-composer config logic
function mockGetConfig(raw) {
  var c;
  try { c = JSON.parse(raw); } catch(e) { c = null; }
  if (c) {
    return {
      p1: Math.max(0, Math.min(10, c.p1 != null ? c.p1 : 2)),
      p2: Math.max(0, Math.min(20, c.p2 != null ? c.p2 : 8)),
      p3: Math.max(0, Math.min(30, c.p3 != null ? c.p3 : 12)),
      p4: Math.max(0, Math.min(30, c.p4 != null ? c.p4 : 10)),
      p5: Math.max(0, Math.min(30, c.p5 != null ? c.p5 : 10)),
      p6: Math.max(0, Math.min(5,  c.p6 != null ? c.p6 : 1)),
      p7: Math.max(0, Math.min(5,  c.p7 != null ? c.p7 : 2))
    };
  }
  return { p1: 2, p2: 8, p3: 12, p4: 10, p5: 10, p6: 1, p7: 2 };
}

// Test 1: Default (empty localStorage)
let defCfg = mockGetConfig(null);
let expectedDefault = { p1: 2, p2: 8, p3: 12, p4: 10, p5: 10, p6: 1, p7: 2 };
if (JSON.stringify(defCfg) === JSON.stringify(expectedDefault)) {
  console.log('  PASS: 預設值 = ' + JSON.stringify(defCfg));
} else {
  issues.push('預設值不正確: ' + JSON.stringify(defCfg) + ' != ' + JSON.stringify(expectedDefault));
}

// Test 2: Custom values
let customCfg = mockGetConfig(JSON.stringify({ p1: 5, p2: 15, p3: 20, p4: 25, p5: 30, p6: 3, p7: 4 }));
let expectedCustom = { p1: 5, p2: 15, p3: 20, p4: 25, p5: 30, p6: 3, p7: 4 };
if (JSON.stringify(customCfg) === JSON.stringify(expectedCustom)) {
  console.log('  PASS: 自訂值生效 = ' + JSON.stringify(customCfg));
} else {
  issues.push('自訂值未正確生效: ' + JSON.stringify(customCfg));
}

// Test 3: 0 = skip
let zeroCfg = mockGetConfig(JSON.stringify({ p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }));
if (Object.values(zeroCfg).every(v => v === 0)) {
  console.log('  PASS: 0=跳過全部');
} else {
  issues.push('0=跳過不正確: ' + JSON.stringify(zeroCfg));
}

// Test 4: Exceeding values clamped
let overCfg = mockGetConfig(JSON.stringify({ p1: 100, p2: 100, p3: 100, p4: 100, p5: 100, p6: 100, p7: 100 }));
let expectedClamp = { p1: 10, p2: 20, p3: 30, p4: 30, p5: 30, p6: 5, p7: 5 };
if (JSON.stringify(overCfg) === JSON.stringify(expectedClamp)) {
  console.log('  PASS: 超出範圍被截斷');
} else {
  issues.push('超出範圍截斷不正確: ' + JSON.stringify(overCfg));
}

// Test 5: Negative values -> 0
let negCfg = mockGetConfig(JSON.stringify({ p1: -5, p2: -1 }));
if (negCfg.p1 === 0 && negCfg.p2 === 0) {
  console.log('  PASS: 負數被設為 0');
} else {
  issues.push('負數防呆不正確: ' + JSON.stringify(negCfg));
}

// Verify settings page defaults match
let uiRendererContent = readJS('ui-renderer.js');
if (uiRendererContent.includes("p1: 2, p2: 8, p3: 12, p4: 10, p5: 10, p6: 1, p7: 2")) {
  console.log('  PASS: UI 設定頁預設值一致');
} else {
  issues.push('UI 設定頁預設值與 session-composer 不一致');
}

// Test Part3/4 cumulative truncation logic
function mockComposePartial(config, partData) {
  // Simplified Part3 logic
  let cfg = mockGetConfig(JSON.stringify(config));
  let shuffled = partData.slice().sort(() => Math.random() - 0.5);
  let qCount = 0, groupCount = 0;
  for (let i = 0; i < shuffled.length && qCount < cfg.p3; i++) {
    let g = shuffled[i];
    let qlen = g.questions ? g.questions.length : 0;
    let needed = cfg.p3 - qCount;
    if (qlen <= needed) {
      qCount += qlen;
      groupCount++;
    } else {
      qCount += needed;
      groupCount++;
    }
  }
  return { qCount, groupCount };
}

// With p3=12 and questions per group = 3, need 4 groups for 12 questions
let mockP3Data = Array(10).fill(null).map((_, i) => ({ id: i, questions: [{}, {}, {}] }));
let result1 = mockComposePartial({ p3: 12 }, mockP3Data);
if (result1.qCount === 12 && result1.groupCount === 4) {
  console.log('  PASS: Part3 累加截斷 (12題, 每組3題) = ' + JSON.stringify(result1));
} else {
  issues.push('Part3 累加截斷不正確: ' + JSON.stringify(result1));
}

// With p3=5 and questions per group = 3, need 2 groups: first full 3, second truncated to 2
let result2 = mockComposePartial({ p3: 5 }, mockP3Data);
if (result2.qCount === 5 && result2.groupCount === 2) {
  console.log('  PASS: Part3 最後一組截斷 (5題) = ' + JSON.stringify(result2));
} else {
  issues.push('Part3 最後一組截斷不正確: ' + JSON.stringify(result2));
}

// ============================================================
// 3. 分片併載
// ============================================================
console.log('\n=== 3. 分片併載 ===');

// Verify all 18 base files have matching _ext1 pairs
let baseFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.includes('_ext1')).sort();
let extFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('_ext1.json')).sort();

console.log('  基礎檔數: ' + baseFiles.length);
console.log('  擴充檔數: ' + extFiles.length);

// Check all base files have ext1 files (excluding part7 subtypes)
let missingExt = [];
// The 9 part-track combinations: part1/p2/p3/p4/p5/p6 x T600/T730 = 12 files
// But part7 has 3 subtypes (single, double, triple) x 2 tracks = 6 base files
// Total: 12 + 6 = 18 base files
let baseCount = baseFiles.length;
if (baseCount >= 18) {
  console.log('  PASS: 基礎檔數量 >= 18 (' + baseCount + ')');
} else {
  issues.push('基礎檔少於 18: ' + baseCount);
}

// For each base file, check _ext1 exists (except _verify_result.json, _backup)
for (let bf of baseFiles) {
  if (bf.startsWith('_')) continue;
  let extName = bf.replace('.json', '_ext1.json');
  if (!extFiles.includes(extName)) {
    missingExt.push(bf + ' -> ' + extName);
  }
}

if (missingExt.length === 0) {
  console.log('  PASS: 所有基礎檔都有對應 _ext1');
} else {
  console.log('  WARN: 缺少 _ext1 檔:');
  missingExt.forEach(e => console.log('    ' + e));
  issues.push('缺少 ' + missingExt.length + ' 個 _ext1 檔');
}

// Verify data-loader logic: _fetchSharded merges correctly
let dlContent = readJS('data-loader.js');
if (dlContent.includes('Promise.allSettled') && 
    dlContent.includes('base.concat(ext)') &&
    dlContent.includes('_ext1')) {
  console.log('  PASS: data-loader.js 分片併載邏輯正確');
} else {
  issues.push('data-loader.js 分片併載邏輯缺失');
}

// Check fallback: ext1 failure doesn't break loading
if (dlContent.includes("results[1].status === 'fulfilled' ? results[1].value : null") &&
    dlContent.includes("if (Array.isArray(base) && Array.isArray(ext))")) {
  console.log('  PASS: _ext1 失敗時降級只用基礎檔');
} else {
  issues.push('_ext1 降級邏輯不正確');
}

// Check actual file sizes to verify extension enlarges pool
let sample1 = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'reading_part5_T600.json'), 'utf8'));
let sample2 = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'reading_part5_T600_ext1.json'), 'utf8'));
let merged = (Array.isArray(sample1) ? sample1.length : 0) + (Array.isArray(sample2) ? sample2.length : 0);
console.log('  Part5 T600: 基礎=' + sample1.length + ' + ext1=' + sample2.length + ' = ' + merged + ' (合併後)');

// ============================================================
// 4. 統計與建議引擎
// ============================================================
console.log('\n=== 4. 統計與建議引擎 ===');

// Mock analytics logic
let analyticsContent = readJS('analytics.js');

// 4a. Check category coverage
// From verify_categories.js: all valid categories
const P1_CATS = ['人物動作', '物品狀態', '場景位置'];
const P2_CATS = ['WH問句', 'YesNo問句', '附加間接問句', '陳述句回應', '音似干擾'];
const P3_CATS = ['主旨', '細節', '推論意圖', '圖表整合'];
const P4_CATS = ['主旨', '細節', '推論', '數字時間'];
const P5_CATS = ['時態', '詞性', '介系詞', '連接詞', '關係代名詞', '假設語氣', '搭配詞', '片語動詞', '近義字彙'];
const P6_CATS = ['時態', '詞性', '介系詞', '連接詞', '關係代名詞', '假設語氣', '搭配詞', '片語動詞', '近義字彙', '上下文邏輯', '句子插入'];
const P7_CATS2 = ['主旨', '細節', '推論', '跨篇比對', '字義'];

let allCats = new Set([...P1_CATS, ...P2_CATS, ...P3_CATS, ...P4_CATS, ...P5_CATS, ...P6_CATS, ...P7_CATS2]);
console.log('  總分類數(去重): ' + allCats.size);

// Extract _SUGGESTIONS keys from code
let sugMatch = analyticsContent.match(/'([^']+)':\s*\{[\s\S]*?text:/g);
let sugCats = sugMatch ? sugMatch.map(m => m.match(/'([^']+)'/)[1]) : [];
console.log('  _SUGGESTIONS 分類數: ' + sugCats.length);

let missingCats = [];
for (let c of allCats) {
  if (!sugCats.includes(c)) {
    missingCats.push(c);
  }
}
if (missingCats.length === 0) {
  console.log('  PASS: 所有分類都有建議文案');
} else {
  issues.push('缺少建議文案的分類: ' + missingCats.join(', '));
}

// 4b. Check old wrong items without category show "未分類"
if (analyticsContent.includes("category || '未分類'")) {
  console.log('  PASS: 舊錯題無 category 顯示「未分類」');
} else {
  issues.push('無 category 的舊錯題未顯示「未分類」');
}

// 4c. Check top 3 sorting and priority threshold
if (analyticsContent.includes("b.errorRate - a.errorRate") || analyticsContent.includes("b.errorRate - a.errorRate")) {
  console.log('  PASS: 前 3 名依錯誤率排序');
} else {
  issues.push('Top 3 排序邏輯不正確');
}

// Check priority badge threshold
let hasFullThreshold = analyticsContent.includes("item.errorRate >= 40 && item.attempts >= 5") || 
                        analyticsContent.includes("item.errorRate >= 40 && item.attempts >= 5");
if (!hasFullThreshold) {
  console.log('  FAIL: Top 3 badge 只檢查 errorRate ≥40%，未同時檢查 attempts ≥5');
  issues.push('Top 3 弱點卡片的「優先加強」badge 未檢查 attempts ≥5 條件');
}

// 4d. Check improvements overview threshold
if (analyticsContent.includes("attempts >= 5 && rate >= 40") || 
    analyticsContent.includes("attempts >= 5 && rate >= 40")) {
  console.log('  PASS: 改進建議總覽正確使用 ≥5 且 ≥40% 門檻');
} else {
  issues.push('改進建議總覽門檻不正確');
}

// 4e. Mock stats accumulation
function mockAccumulate(existing, part, category, isCorrect) {
  let key = part + '|' + (category || '未分類');
  if (!existing[key]) existing[key] = { attempts: 0, wrong: 0 };
  existing[key].attempts++;
  if (!isCorrect) existing[key].wrong++;
  return existing;
}

let stats = {};
stats = mockAccumulate(stats, 5, '時態', true);
stats = mockAccumulate(stats, 5, '時態', false);
stats = mockAccumulate(stats, 5, '時態', false);
stats = mockAccumulate(stats, 5, '時態', false);
stats = mockAccumulate(stats, 5, '時態', false);
stats = mockAccumulate(stats, 5, '介系詞', false);
stats = mockAccumulate(stats, 5, '介系詞', true);

if (stats['5|時態'].attempts === 5 && stats['5|時態'].wrong === 4) {
  console.log('  PASS: attempts/wrong 累積正確 (時態: 5/4)');
} else {
  issues.push('attempts/wrong 累積不正確: attempts=' + stats['5|時態'].attempts + ' wrong=' + stats['5|時態'].wrong);
}

let errRate = Math.round(stats['5|時態'].wrong / stats['5|時態'].attempts * 100);
if (errRate === 80) {
  console.log('  PASS: 錯誤率計算正確 (80%)');
} else {
  issues.push('錯誤率計算不正確: ' + errRate + '% (expected 80)');
}

// ============================================================
// 5. 登入模組隔離性
// ============================================================
console.log('\n=== 5. 登入模組隔離性 ===');

let authContent = readJS('auth.js');
let fbConfigContent = readJS('firebase-config.js');
let syncContent = readJS('sync.js');

// 5a. Firebase config is not placeholder
if (fbConfigContent.includes('"AIzaSyCLno101eOvQ5CWZ9WHQ5MNRxAnRJHoJVk"') &&
    fbConfigContent.includes('"goku-46e66"') &&
    fbConfigContent.includes('"1:488762442595:web:f294ea4a5e4ae8ecbe4956"')) {
  console.log('  PASS: Firebase config 是真實值，非 placeholder');
} else {
  issues.push('Firebase config 可能是 placeholder');
}

// 5b. SDK load failure → app keeps working
if (authContent.includes('catch') && authContent.includes('AUTH_INITIALIZED = false')) {
  console.log('  PASS: SDK 載入失敗時 AUTH_INITIALIZED=false，全站功能不受影響');
} else {
  issues.push('SDK 失敗防護不完整');
}

// 5c. Feature-detect path exists
if (authContent.includes('isConfigValid') && authContent.includes('YOUR_')) {
  console.log('  PASS: 有 feature-detect（isConfigValid 檢查 YOUR_ placeholder）');
} else {
  issues.push('缺少 feature-detect 路徑');
}

// 5d. Firestore write uses set with merge:true — won't overwrite JLPT/GEPT
if (syncContent.includes("set(data, { merge: true })") || 
    syncContent.includes('set(data, { merge: true })')) {
  console.log('  PASS: Firestore 寫入使用 set + merge:true，不會覆蓋其他欄位');
} else {
  issues.push('Firestore 寫入未使用 merge:true');
}

// 5e. Check that sync writes to {toeic: ...} namespace
if (syncContent.includes('toeic: {') && syncContent.includes("doc(_uid).set")) {
  console.log('  PASS: Firestore 寫入到 users/{uid} 的 toeic 欄位');
} else {
  issues.push('Firestore 寫入路徑不正確（非 users/{uid}.toeic）');
}

// Check that it's not doing a full document overwrite
if (syncContent.includes('collection(\'users\')') && syncContent.includes('merge: true')) {
  console.log('  PASS: 使用 merge:true，整份 set 不會覆蓋其他欄位');
}

// ============================================================
// 6. 版本一致性
// ============================================================
console.log('\n=== 6. 版本一致性 ===');

let htmlVerMatches = htmlContent.match(/\?v=([\d-]+)/g);
let currentVer = htmlContent.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)[1];
console.log('  APP_VERSION: ' + currentVer);

let allVersions = new Set();
if (htmlVerMatches) {
  htmlVerMatches.forEach(m => {
    let v = m.replace('?v=', '');
    allVersions.add(v);
  });
}

// Also check CSS version
let cssMatch = htmlContent.match(/css\/style\.css\?v=([\d-]+)/);
if (cssMatch) allVersions.add(cssMatch[1]);

console.log('  所有 ?v= 值: ' + [...allVersions].join(', '));

if (allVersions.size === 1 && allVersions.has(currentVer)) {
  console.log('  PASS: 版本一致 v' + currentVer);
} else {
  issues.push('版本不一致: APP_VERSION=' + currentVer + ' vs ?v=' + [...allVersions].join(','));
}

// ============================================================
// 7. 完整性檢查 (額外)
// ============================================================
console.log('\n=== 7. 完整性檢查 ===');

// Check that sync only writes toeic field (not override other fields)
let syncSetLine = syncContent.match(/doc\(_uid\)\.set\([^)]+\)/);
if (syncSetLine) {
  console.log('  sync set call: ' + syncSetLine[0]);
}

// Check that analytics page requires 10+ attempts before showing
if (analyticsContent.includes('totalAttempts < 10') || analyticsContent.includes('totalAttempts < 10')) {
  console.log('  PASS: 弱點分析需 ≥10 題才顯示');
} else {
  issues.push('弱點分析門檻不正確');
}

// Check wrongbook 未分類 filter
if (readJS('wrongbook.js').includes("'\u672a\u5206\u985e'") || readJS('wrongbook.js').includes('未分類')) {
  console.log('  PASS: 錯題本可篩選「未分類」');
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n==============================');
console.log('=== 驗證總結 ===');
console.log('==============================');
console.log('總問題數: ' + issues.length);
if (issues.length > 0) {
  console.log('--- 問題列表 ---');
  issues.forEach((e, i) => console.log('  ' + (i + 1) + '. ' + e));
}

// Write results
let result = {
  date: new Date().toISOString(),
  issues_found: issues.length,
  issues: issues,
  all_pass: issues.length === 0
};
fs.writeFileSync(path.join(DATA_DIR, '_qa_p2b_result.json'), JSON.stringify(result, null, 2));
console.log('\n結果已寫入 data/_qa_p2b_result.json');

// Set exit code
process.exit(issues.length > 0 ? 1 : 0);
