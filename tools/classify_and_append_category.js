// classify_and_append_category.js  v2
// Fixes: Part2 case-sensitivity, Part5 verb-tense/modals/comparative logic

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');

// ── Word sets ─────────────────────────────────────────────────────────
const PREPOSITIONS = new Set([
  'by','until','since','during','from','on','at','between','into','onto','within','without',
  'upon','beyond','across','through','throughout','along','around','over','under','above',
  'below','beside','besides','next to','in front','behind','near','off','of','for','with',
  'to','toward','towards','about','against','among','amongst','including','except','despite',
  'in spite','due to','because of','owing to','up','down','before','after','like','as',
  'inside','outside','regarding','concerning','past','per','via','except for','apart from',
  'in addition to','instead of','prior to','ahead of','thanks to','according to','along with',
  'together with','rather than','other than','no later than','as for','as to','as of',
]);
const CONJUNCTIONS = new Set([
  'and','but','or','so','nor','yet','for',
  'if','unless','because','since','as','although','though','even though','while','whereas',
  'whether','that','so that','provided','in case','once','when','then',
  'as if','as though','as long','as long as','as soon','as soon as','as well','as far','now that','in order',
  'therefore','however','moreover','furthermore','nevertheless','otherwise','thus',
  'accordingly','consequently','meanwhile','instead','nonetheless','regardless',
  'in addition','for example','for instance','on the other hand','in contrast','as a result',
  'even if','only if','except that','no matter','in that','given that','supposing',
]);
const REL_PRONOUNS = new Set([
  'which','who','that','whom','whose','where','when','why','what','whoever','whichever',
  'whatever','whomever',
]);
const MODALS = new Set([
  'must','might','could','would','should','can','will','may','shall','need','ought','dare',
]);

function lowercaseWords(words) {
  return words.map(w => w.toLowerCase().trim());
}

// ── Helpers ───────────────────────────────────────────────────────────
function isFullSentence(str) {
  if (!str || str.length < 5) return false;
  return /^[A-Z]/.test(str.trim()) && /[.!?]$/.test(str.trim());
}

function getStem(word) {
  const w = word.toLowerCase().trim();
  return w
    .replace(/(ingly|edly)$/, '')
    .replace(/(ing|ed)$/, '')
    .replace(/(es|ness|ment|tion|sion|ance|ence|able|ible|ous|ful|less|ive|ate|ize|ise|ify|ist|ism|ity|ty|cy|ence|ance|ure|al|ly|or|er|est|s)$/, '')
    .replace(/e$/, '');
}

function areAllSameRoot(opts) {
  const stems = opts.map(o => getStem(o));
  const first = stems[0];
  if (first.length < 3) return false;
  return stems.every(s => s === first);
}

function areAllPrepositions(opts) {
  if (opts.length < 3) return false;
  const lower = lowercaseWords(opts);
  return lower.every(o => PREPOSITIONS.has(o));
}

function areAllConjunctions(opts) {
  if (opts.length < 3) return false;
  const lower = lowercaseWords(opts);
  return lower.every(o => CONJUNCTIONS.has(o));
}

function hasRelPronouns(opts) {
  const lower = lowercaseWords(opts);
  return lower.some(o => REL_PRONOUNS.has(o));
}

function areAllModals(opts) {
  const lower = lowercaseWords(opts);
  return lower.length >= 3 && lower.every(o => MODALS.has(o));
}

// Verb tense: options are different tense forms of the SAME verb
function areVerbTenseOptions(opts, explanation) {
  const lower = lowercaseWords(opts);
  // all modal verbs → not tense, that's vocab
  if (areAllModals(opts)) return false;
  // If all are same root and include ed/ing/base variations, it's tense
  if (areAllSameRoot(opts)) {
    // Has at least one past/ing form AND one base form → tense pattern
    const hasBase = lower.some(w => !/(ed|ing)$/.test(w) && !/(es|s)$/.test(w) || w.endsWith('es') || w.endsWith('s'));
    const hasInflected = lower.some(w => /(ed|ing)$/.test(w));
    if (hasBase && hasInflected) return true;
  }
  // Also check for compound tense patterns (has been, will be, etc.)
  const hasAuxPattern = lower.some(o =>
    /^(has|have|had|will|would|is|are|was|were|be|been|being)\b/.test(o) ||
    /^(has|have|had)\s+(been\s+)?\w+ed/.test(o) ||
    /^(will|would)\s+(be\s+)?\w+/.test(o)
  );
  if (hasAuxPattern) return true;
  // Check explanation for tense keywords
  if (explanation) {
    const e = explanation.toLowerCase();
    if (/時態|過去式|現在式|未來式|完成式|進行式|被動|比較級|最高級|第三人稱|單數|複數形式|原形動詞|不定詞|過去分詞/.test(e)) return true;
  }
  return false;
}

// Word form (noun/adj/adv/verb) - different grammatical forms of the same root
function areWordFormOptions(opts) {
  if (opts.length < 3) return false;
  if (!areAllSameRoot(opts)) return false;
  // If it's verb tense (as detected above), don't call it word form
  // Word form: typically has noun, adj, adv, or verb variations
  const lower = lowercaseWords(opts);
  const hasNounForm = lower.some(w => /(tion|sion|ment|ness|ity|ty|cy|ence|ance|ure|ism|ist)$/.test(w));
  const hasAdjForm = lower.some(w => /(able|ible|ous|ful|less|ive|al|ic|ant|ent)$/.test(w));
  const hasAdvForm = lower.some(w => /ly$/.test(w) && !/(ily|edly)$/.test(w));
  const hasVerbForm = lower.some(w => /(ify|ize|ise|ate|en)$/.test(w));
  // Check if at least 2 different form types exist
  const formTypes = [hasNounForm, hasAdjForm, hasAdvForm, hasVerbForm].filter(Boolean).length;
  return formTypes >= 1;
}

function isCollocation(explanation, options) {
  if (!explanation) return false;
  const e = explanation.toLowerCase();
  // Fixed collocations only - not generic "搭配"
  if (/固定搭配|慣用語|慣用說法|成語|固定用法|固定片語|常見搭配/.test(e)) return true;
  // Specific collocation patterns
  if (/take.*meeting.*minutes|make.*decision|make.*effort|make.*progress|due to|owing to|according to|in charge|in order|at least|at most/.test(e)) return true;
  // If options are similar-meaning verbs/nouns where the test is collocation knowledge
  if (/固定搭配/.test(e)) return true;
  // "a large __" where answer is "order" → word form, not collocation
  return false;
}

function isPhrasalVerb(opts, explanation) {
  const lower = lowercaseWords(opts);
  const hasTwoParts = lower.filter(o => o.split(/\s+/).length === 2).length;
  if (hasTwoParts >= 2) {
    const excluded = new Set(['due to','because of','in spite','as well','a lot','next to','in front',
      'such as','so that','even though','as if','as though','more fast','more faster','more slow',
      'more slower','most fast','most slow','less than','more than','no later','according to',
      'instead of','apart from','along with','in addition','as long','as soon','in case',
      'for example','for instance','as a result','on the other','in contrast','no matter',
      'other than','except for','prior to','rather than','ahead of','thanks to','together with',
    ]);
    const verbWords = new Set(['look','get','take','put','give','come','make','set','turn','bring',
      'call','carry','cut','fill','find','hand','hold','keep','let','move','pick','point','pull',
      'run','show','sign','start','throw','turn','work','check','drop','figure','go','hang']);
    const hasVerb = lower.some(o => {
      const parts = o.split(/\s+/);
      return parts.length === 2 && verbWords.has(parts[0]) && !excluded.has(o);
    });
    if (hasVerb) return true;
  }
  if (explanation) {
    const e = explanation.toLowerCase();
    if (/片語動詞|phrasal.*verb|動詞片語/.test(e)) return true;
  }
  return false;
}

function isSubjunctiveMood(explanation) {
  if (!explanation) return false;
  const e = explanation.toLowerCase();
  return /假設語氣|與事實相反|were to|subjunctive|建議.*動詞原形|要求.*動詞原形/.test(e);
}

function isContextLogic(explanation) {
  if (!explanation) return false;
  const e = explanation.toLowerCase();
  return /上下文|語意|邏輯|銜接|承接|語氣|最自然|最適合|公告常見|email常用|上下文來看/.test(e);
}

// ── Part 5 classification ────────────────────────────────────────────
function classifyPart5(explanation, options) {
  const opts = (options || []).map(o => String(o).trim());
  const expl = explanation || '';
  
  if (areAllPrepositions(opts)) return '介系詞';
  if (areAllConjunctions(opts)) return '連接詞';
  if (hasRelPronouns(opts)) return '關係代名詞';
  if (isSubjunctiveMood(expl)) return '假設語氣';
  if (areAllModals(opts)) return '近義字彙';
  if (isPhrasalVerb(opts, expl)) return '片語動詞';
  if (isCollocation(expl, opts)) return '搭配詞';
  if (areVerbTenseOptions(opts, expl)) return '時態';
  if (areWordFormOptions(opts)) return '詞性';
  
  // Fallback based on explanation keywords
  const e = expl.toLowerCase();
  if (/時態|過去式|現在式|未來式|完成式|進行式|被動|比較級|最高級|第三人稱|單數.*動詞|主詞動詞一致/.test(e)) return '時態';
  if (/詞性|形容詞|副詞|名詞/.test(e)) return '詞性';
  if (/介系詞|介詞|前.*介系/.test(e)) return '介系詞';
  if (/連接詞|連接副詞|連接/.test(e)) return '連接詞';
  if (/關係代名詞|關係副詞/.test(e)) return '關係代名詞';
  if (/搭配|慣用|固定/.test(e)) return '搭配詞';
  if (/片語/.test(e)) return '片語動詞';
  if (/假設|與事實/.test(e)) return '假設語氣';
  if (/近義|語意|語境|語氣/.test(e)) return '近義字彙';
  
  return '近義字彙';
}

// ── Part 6 blank classification ──────────────────────────────────────
function classifyPart6Blank(blank, passageObj) {
  const opts = (blank.options || []).map(o => String(o).trim());
  const expl = blank.explanation || '';
  
  // Detect sentence-insertion type blanks
  const hasFullSentence = opts.some(o => isFullSentence(o));
  const areLongPhrases = opts.every(o => o.split(/\s+/).length >= 4) && opts.some(o => isFullSentence(o));
  
  if (areLongPhrases) return '句子插入';
  
  // Context/logic (short phrases where meaning matters more than grammar)
  if (isContextLogic(expl) && !areAllSameRoot(opts) && !areAllPrepositions(opts) && !areAllConjunctions(opts) && !hasRelPronouns(opts)) {
    const allShort = opts.every(o => o.split(/\s+/).length <= 3);
    if (allShort && !areVerbTenseOptions(opts, expl)) return '上下文邏輯';
  }
  
  // When options are full sentences without obvious grammar test
  if (hasFullSentence && !areVerbTenseOptions(opts, expl)) return '上下文邏輯';
  
  return classifyPart5(expl, opts);
}

// ── Part 1 ───────────────────────────────────────────────────────────
function classifyPart1(item) {
  const desc = (item.imageDescription || '').toLowerCase();
  const peopleWords = /\b(man|woman|person|people|lady|gentleman|boy|girl|customer|worker|employee|staff|group|crowd|colleague|passenger|attendant|driver|patient|audience|spectator|visitor|traveler|commuter|clerk|officer|secretary|manager|assistant|technician|receptionist|waiter|waitress|chef|cook|salesperson|vendor|farmer|gardener|pilot|soldier|doctor|nurse|teacher|student|child|children|men|women)\b/i;
  if (peopleWords.test(desc)) return '人物動作';
  
  const objectState = /\b(a|an|the)\s+(\w+)\s+(is|are|sits?|stands?|hangs?|lies?|displays?|shows?|appears?|looks?)\b/i;
  if (objectState.test(desc) && !peopleWords.test(desc)) return '物品狀態';
  
  // If involves people, it's human action
  if (/(is|are)\s+(typing|walking|standing|sitting|talking|reading|holding|carrying|shaking|serving|working|looking|writing|eating|drinking|demonstrating|opening|closing|giving|receiving|pointing|adjusting|pushing|pulling|lifting|moving|handing|gesturing|delivering|unloading|riding|driving|climbing|entering|exiting|presenting|operating|repairing|fixing|cleaning|cooking|pouring|arranging|organizing|examining|inspecting|checking|signing|watering|wearing|smiling|laughing|waiting|boarding)/.test(desc) && peopleWords.test(desc)) {
    return '人物動作';
  }
  
  // If description mentions objects being in a state
  if (/\b(chair|table|desk|computer|laptop|book|phone|document|file|briefcase|bag|car|vehicle|machine|equipment|tool|furniture|plant|tree|building|door|window|wall|floor|sign|screen|monitor|keyboard|printer|calendar|clock|painting|picture|box|crate|package|container|bottle|cup|glass|dish|plate|food|drink)\b/i.test(desc)) {
    return '物品狀態';
  }
  
  if (/\b(in|on|at|near|next to|in front|behind|beside|between|outside|inside|across|along|around|above|below|over|under)\b/i.test(desc)) {
    return '場景位置';
  }
  
  return '人物動作';
}

// ── Part 2 ───────────────────────────────────────────────────────────
function classifyPart2(item) {
  const script = (item.audioScript || '').trim();
  const expl = (item.explanation || '');
  
  // Tag question patterns (negative + positive tags)
  // Pattern: "..., haven't you?" or "..., have you?"
  const tagSubject = '(you|they|it|he|she|we|i|there)';
  const negTagRe = new RegExp(',\\s*(isn[\'\']t|aren[\'\']t|wasn[\'\']t|weren[\'\']t|don[\'\']t|doesn[\'\']t|didn[\'\']t|haven[\'\']t|hasn[\'\']t|can[\'\']t|couldn[\'\']t|won[\'\']t|wouldn[\'\']t|shouldn[\'\']t)\\s+' + tagSubject + '\\??\\s*$', 'i');
  const posTagRe = new RegExp(',\\s*(do|does|did|is|are|was|were|have|has|had|will|can|could|should|would|may)\\s+' + tagSubject + '\\??\\s*$', 'i');
  if (negTagRe.test(script) || posTagRe.test(script)) return '附加間接問句';
  
  // Indirect / embedded questions
  if (/do you know|can you tell|do you think|do you remember|i wonder|i['']m wondering|could you tell|would you mind|may i ask|would you happen to know|could you clarify|could you elaborate|can you explain|remind me|do you recall|do you happen to know|what do you think|how do you feel|do you have any idea/i.test(script)) return '附加間接問句';
  
  // WH questions
  if (/^(what|when|where|who|why|how|which|whose|whom|to\s+what\s+extent|how\s+(many|much|long|far|often|old|come))\b/i.test(script)) return 'WH問句';
  
  // Yes/No questions
  if (/^(do|does|did|is|are|was|were|have|has|had|will|would|can|could|may|might|should|shall|am)\b/i.test(script)) return 'YesNo問句';
  if (/^(isn['']t|aren['']t|wasn['']t|weren['']t|don['']t|doesn['']t|didn['']t|haven['']t|hasn['']t|can['']t|couldn['']t|won['']t|wouldn['']t|shouldn['']t)\b/i.test(script)) return 'YesNo問句';
  
  if (/音似/.test(expl)) return '音似干擾';
  
  if (!script.endsWith('?')) return '陳述句回應';
  return 'YesNo問句';
}

// ── Part 3/4/7 question classification ──────────────────────────────
function classifyQuestion(questionObj, part) {
  const q = (questionObj.question || '').toLowerCase();
  const expl = (questionObj.explanation || '').toLowerCase();
  
  if (part === 3) {
    if (questionObj.requiresChart === true) return '圖表整合';
    // Main idea / purpose
    if (/(mainly|main\s+(topic|idea|subject|purpose|point)|primarily|conversation\s+(is\s+)?about|discussing|concerned\s+about|topic\s+of)/.test(q)) return '主旨';
    // Inference / next action
    if (/(infer|imply|suggest|indicate|most\s+likely|probably|next|following|will.*(do|happen|take)|going\s+to|plan\s+to|intend|probably|likely\s+to|based\s+on.*what\s+can\s+we)/.test(q)) return '推論意圖';
    // Check explanation
    if (/推論|推測|推断|推斷|意圖|打算|計畫|將要|會去做|接下來/.test(expl)) return '推論意圖';
    // Check directly for main topic questions
    if (/what\s+(is|are)\s+(the\s+)?(speakers?|they|the\s+people)\s+(mainly\s+)?(discussing|talking|about)/.test(q)) return '主旨';
    return '細節';
  }
  
  if (part === 4) {
    // Main idea / purpose
    if (/(mainly|main\s+(topic|idea|subject|purpose|point|reason)|primarily|primarily\s+about|purpose\s+of|objective|intention|goal\s+of|announcement|broadcast|message|talk\s+(is\s+)?about|mostly\s+about)/.test(q)) return '主旨';
    // Numbers/time
    if (/(how\s+(many|much|long|far|old)|what\s+time|what\s+the\s+(time|date)|what\s+(year|month|day|week|price|cost|fee|number|amount|percentage|percent|rate)|at\s+what\s+time|which\s+(date|day|time|year|month))/i.test(q)) return '數字時間';
    if (/^(when|how\s+(many|much|long|often))\b/i.test(q)) return '數字時間';
    // Inference
    if (/(infer|imply|suggest|indicate|most\s+likely|probably|suggest|assume|conclude)/.test(q)) return '推論';
    if (/推論|推測|推断|暗示|表明/.test(expl)) return '推論';
    return '細節';
  }
  
  if (part === 7) {
    if (questionObj.crossReference === true) return '跨篇比對';
    // Main idea / purpose
    if (/(mainly|main\s+(idea|point|purpose|topic|concern|theme)|primary|primarily|purpose|subject|best\s+(title|heading)|appropriate\s+title|what\s+is\s+the\s+(announcement|notice|article|email|memo|letter|report|passage|text|document|advertisement|ad)\s+(mainly|mostly|primarily)?\s*about)/.test(q)) return '主旨';
    // Vocabulary
    if (/(meaning\s+of|closest\s+in\s+meaning|synonym|word\s+meaning|definition|what\s+does.*mean|the\s+word.*(means|refers)|most\s+similar\s+meaning|most\s+closely\s+related|could\s+be\s+replaced|is\s+synonymous|near\s+synonym)/i.test(q)) return '字義';
    // Inference
    if (/(infer|imply|suggest|indicate|most\s+likely|probably|suggest|assume|conclude|can\s+(we|you)\s+infer|what\s+can\s+(we|you)\s+(infer|conclude)|suggested\s+by|implied)/.test(q)) return '推論';
    if (/推論|推測|推断|暗示|表明/.test(expl)) return '推論';
    return '細節';
  }
  
  return '細節';
}

// ── Process a single file ────────────────────────────────────────────
function processFile(filePath) {
  const baseName = path.basename(filePath, '.json');
  console.log(`\n=== Processing ${baseName} ===`);
  
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  
  let partNum = null;
  if (data.length > 0) {
    partNum = data[0].part;
  }
  if (partNum === null) {
    if (baseName.includes('part1')) partNum = 1;
    else if (baseName.includes('part2')) partNum = 2;
    else if (baseName.includes('part3')) partNum = 3;
    else if (baseName.includes('part4')) partNum = 4;
    else if (baseName.includes('part5')) partNum = 5;
    else if (baseName.includes('part6')) partNum = 6;
    else if (baseName.includes('part7')) partNum = 7;
  }
  
  const stats = {};
  let totalTagged = 0;
  
  for (const item of data) {
    if (partNum === 1) {
      item.category = classifyPart1(item);
      stats[item.category] = (stats[item.category] || 0) + 1;
      totalTagged++;
    } else if (partNum === 2) {
      item.category = classifyPart2(item);
      stats[item.category] = (stats[item.category] || 0) + 1;
      totalTagged++;
    } else if (partNum === 5) {
      item.category = classifyPart5(item.explanation || '', item.options || []);
      stats[item.category] = (stats[item.category] || 0) + 1;
      totalTagged++;
    } else if (partNum === 3 || partNum === 4 || partNum === 7) {
      if (!Array.isArray(item.questions)) continue;
      for (const q of item.questions) {
        q.category = classifyQuestion(q, partNum);
        stats[q.category] = (stats[q.category] || 0) + 1;
        totalTagged++;
      }
    } else if (partNum === 6) {
      if (!Array.isArray(item.blanks)) continue;
      for (const b of item.blanks) {
        b.category = classifyPart6Blank(b, item);
        stats[b.category] = (stats[b.category] || 0) + 1;
        totalTagged++;
      }
    }
  }
  
  const newStr = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, newStr + '\n', 'utf8');
  
  console.log(`  Items tagged: ${totalTagged}`);
  console.log(`  Distribution: ${JSON.stringify(stats)}`);
  
  return { file: baseName, totalTagged, stats };
}

// ── Main ──────────────────────────────────────────────────────────────
const files = fs.readdirSync(DATA_DIR).filter(f => {
  if (!f.endsWith('.json')) return false;
  if (f.includes('_ext1')) return false;
  return true;
}).sort();

console.log(`Found ${files.length} files to process:\n  ${files.join('\n  ')}`);

const allStats = [];
for (const f of files) {
  const filePath = path.join(DATA_DIR, f);
  try {
    allStats.push(processFile(filePath));
  } catch (err) {
    console.error(`  ERROR processing ${f}:`, err.message);
  }
}

let grandTotal = 0;
const grandDistribution = {};
for (const s of allStats) {
  grandTotal += s.totalTagged;
  for (const [cat, count] of Object.entries(s.stats)) {
    grandDistribution[cat] = (grandDistribution[cat] || 0) + count;
  }
}

console.log(`\n=== GRAND TOTAL ===`);
console.log(`Files: ${allStats.length}`);
console.log(`Total items: ${grandTotal}`);
console.log(`Distribution: ${JSON.stringify(grandDistribution)}`);

fs.writeFileSync(
  path.join(DATA_DIR, '_category_stats.json'),
  JSON.stringify({ grandTotal, grandDistribution, perFile: allStats.map(s => ({ file: s.file, totalTagged: s.totalTagged, stats: s.stats })) }, null, 2)
);
console.log(`\nDone.`);
