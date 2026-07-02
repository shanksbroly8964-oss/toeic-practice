var fs = require('fs');
var path = require('path');

var _lsData = {};

global.window = { TOEIC: {} };
global.TOEIC = global.window.TOEIC;

global.localStorage = {
  getItem: function (key) { return _lsData[key] || null; },
  setItem: function (key, value) { _lsData[key] = String(value); }
};

function reset() { _lsData = {}; }

var scripts = ['storage.js', 'analytics.js'];
scripts.forEach(function (file) {
  var src = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf-8');
  eval(src);
});

var Analytics = TOEIC.Analytics;
var pass = 0;
var fail = 0;

function assert(label, condition) {
  if (condition) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.error('  FAIL: ' + label); }
}

console.log('=== Test 1: recordAttempt accumulates stats ===');
reset();
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u6642\u614B', true);
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u8A5E\u6027', true);
Analytics.recordAttempt(3, '\u7D30\u7BC0', false);

var stats = Analytics.getStats();
assert('5|\u6642\u614B attempts=3', stats['5|\u6642\u614B'].attempts === 3);
assert('5|\u6642\u614B wrong=2', stats['5|\u6642\u614B'].wrong === 2);
assert('5|\u8A5E\u6027 attempts=1', stats['5|\u8A5E\u6027'].attempts === 1);
assert('5|\u8A5E\u6027 wrong=0', stats['5|\u8A5E\u6027'].wrong === 0);
assert('3|\u7D30\u7BC0 wrong=1', stats['3|\u7D30\u7BC0'].wrong === 1);
assert('total attempts=5', Analytics.getTotalAttempts() === 5);

console.log('=== Test 2: category without category value (compat) ===');
reset();
Analytics.recordAttempt(1, '', false);
Analytics.recordAttempt(1, '', true);
var stats2 = Analytics.getStats();
assert('1|\u672A\u5206\u985E exists', !!stats2['1|\u672A\u5206\u985E']);
assert('1|\u672A\u5206\u985E attempts=2', stats2['1|\u672A\u5206\u985E'].attempts === 2);

console.log('=== Test 3: recordSession history ===');
reset();
Analytics.recordSession('2026-07-03', 'single', 'T600', 10, 7);
Analytics.recordSession('2026-07-03', 'composite', 'T730', 50, 38);
var hist = Analytics.getHistory();
assert('history length=2', hist.length === 2);
assert('first session total=10', hist[0].total === 10);
assert('first session correct=7', hist[0].correct === 7);
assert('second session track=T730', hist[1].track === 'T730');

console.log('=== Test 4: groupByPart ===');
reset();
Analytics.recordAttempt(1, '\u4EBA\u7269\u52D5\u4F5C', true);
Analytics.recordAttempt(1, '\u7269\u54C1\u72C0\u614B', false);
Analytics.recordAttempt(1, '\u5834\u666F\u4F4D\u7F6E', true);
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u8A5E\u6027', true);

var parts = Analytics._groupByPart(Analytics.getStats());
assert('Part1 attempts=3', parts[1].attempts === 3);
assert('Part1 wrong=1', parts[1].wrong === 1);
assert('Part5 attempts=3', parts[5].attempts === 3);
assert('Part5 wrong=2', parts[5].wrong === 2);

console.log('=== Test 5: groupByCategory ===');
var cats = Analytics._groupByCategory(Analytics.getStats());
assert('\u6642\u614B attempts=2', cats['\u6642\u614B'].attempts === 2);
assert('\u6642\u614B wrong=2', cats['\u6642\u614B'].wrong === 2);
assert('\u4EBA\u7269\u52D5\u4F5C wrong=0', cats['\u4EBA\u7269\u52D5\u4F5C'].wrong === 0);

console.log('=== Test 6: getTopWeakest (minAttempts=3) ===');
reset();
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u6642\u614B', true);
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u8A5E\u6027', false);
Analytics.recordAttempt(5, '\u8A5E\u6027', true);
Analytics.recordAttempt(5, '\u8A5E\u6027', true);
Analytics.recordAttempt(5, '\u4ECB\u7CFB\u8A5E', false);
Analytics.recordAttempt(5, '\u4ECB\u7CFB\u8A5E', false);
Analytics.recordAttempt(5, '\u4ECB\u7CFB\u8A5E', false);
Analytics.recordAttempt(3, '\u7D30\u7BC0', true);
Analytics.recordAttempt(3, '\u7D30\u7BC0', true);

var top = Analytics.getTopWeakest(3, 3);
assert('top3 length=3', top.length === 3);
assert('top[0] category=\u4ECB\u7CFB\u8A5E', top[0].category === '\u4ECB\u7CFB\u8A5E');
assert('top[0] errorRate=100', top[0].errorRate === 100);
assert('top[1] category=\u6642\u614B', top[1].category === '\u6642\u614B');
assert('top[1] errorRate=67', top[1].errorRate === 67);
assert('top[2] category=\u8A5E\u6027', top[2].category === '\u8A5E\u6027');
assert('top[2] errorRate=33', top[2].errorRate === 33);

console.log('=== Test 7: getTopWeakest with too few data (< minAttempts) ===');
reset();
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u6642\u614B', true);
var topFew = Analytics.getTopWeakest(3, 3);
assert('single cat with <3 attempts excluded', topFew.length === 0);

Analytics.recordAttempt(5, '\u6642\u614B', true);
var top3 = Analytics.getTopWeakest(3, 3);
assert('single cat with =3 attempts included', top3.length === 1);

console.log('=== Test 8: suggestion lookup ===');
var s = Analytics.getSuggestion('\u6642\u614B');
assert('\u6642\u614B has suggestion', s !== null && s.text.indexOf('\u52D5\u8A5E\u6642\u614B') >= 0);
var sNone = Analytics.getSuggestion('unknown');
assert('unknown category returns null', sNone === null);

console.log('=== Test 9: totalAttempts empty ===');
reset();
assert('empty stats total=0', Analytics.getTotalAttempts() === 0);

console.log('=== Test 10: errorRate calculation ===');
reset();
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u6642\u614B', true);
Analytics.recordAttempt(5, '\u6642\u614B', true);
Analytics.recordAttempt(5, '\u6642\u614B', false);
Analytics.recordAttempt(5, '\u6642\u614B', false);
var s10 = Analytics.getStats()['5|\u6642\u614B'];
assert('attempts=5 wrong=3', s10.attempts === 5 && s10.wrong === 3);
assert('errorRate=60%', Math.round(s10.wrong / s10.attempts * 100) === 60);

console.log('');
console.log('=== RESULTS ===');
console.log('Passed: ' + pass + ' / Failed: ' + fail + ' / Total: ' + (pass + fail));

if (fail > 0) {
  console.error('VALIDATION FAILED');
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED');
  process.exit(0);
}
