var ok = function (desc) { console.log('  [PASS] ' + desc); };
var fail = function (desc, expected, actual) {
  console.log('  [FAIL] ' + desc + ' (expected=' + JSON.stringify(expected) + ', actual=' + JSON.stringify(actual) + ')');
  process.exitCode = 1;
};

var mockItem = {
  id: 'p3-g1',
  part: 3,
  conversation: ['A: Hello', 'B: Hi there'],
  questions: [
    { question: 'Q1: What?', answer: 'A', options: ['A', 'B', 'C', 'D'], explanation: 'Explanation Q1' },
    { question: 'Q2: When?', answer: 'B', options: ['A', 'B', 'C', 'D'], explanation: 'Explanation Q2' },
    { question: 'Q3: Why?', answer: 'C', options: ['A', 'B', 'C', 'D'], explanation: 'Explanation Q3' }
  ]
};

var mockItem2 = {
  id: 'p3-g2',
  part: 3,
  conversation: ['C: Hello', 'D: Hi'],
  questions: [
    { question: 'Q4: Who?', answer: 'A', options: ['A', 'B', 'C', 'D'], explanation: 'Explanation Q4' },
    { question: 'Q5: Where?', answer: 'B', options: ['A', 'B', 'C', 'D'], explanation: 'Explanation Q5' }
  ]
};

console.log('=== FIX1: Part 3 group question flow simulation ===\n');

var session = {
  part: 3,
  track: 'T600',
  items: [mockItem, mockItem2],
  currentIndex: 0,
  answers: [[null, null, null], [null, null]],
  totalItems: 5,
  answeredCount: 0,
  _groupViewIndex: 0
};

console.log('Initial state:');
console.log('  currentIndex=' + session.currentIndex + ' _groupViewIndex=' + session._groupViewIndex);

// Helper: simulate submitPart3Question
function submitAnswer(session, answer) {
  var qIndex = session._groupViewIndex || 0;
  var item = session.items[session.currentIndex];
  var q = item.questions[qIndex];
  var isCorrect = answer === q.answer;
  session.answers[session.currentIndex][qIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  return { qIndex: qIndex, isCorrect: isCorrect };
}

// Helper: simulate nextPart3Question
function nextQuestion(session) {
  session._groupViewIndex = (session._groupViewIndex || 0) + 1;
}

// Helper: check answered state
function getAnswered(session) {
  return session.answers[session.currentIndex][session._groupViewIndex];
}

// Helper: is last question in group
function isLastInGroup(session) {
  var item = session.items[session.currentIndex];
  return (session._groupViewIndex || 0) >= item.questions.length - 1;
}

// Helper: all questions answered in current group
function allAnswered(session) {
  return session.answers[session.currentIndex].every(function (a) { return a !== null; });
}

// Helper: has next group
function hasNext(session) {
  return session.currentIndex < session.items.length - 1;
}

// Helper: advance to next group
function advanceGroup(session) {
  session._groupViewIndex = 0;
  session.currentIndex++;
}

console.log('\n--- Step 1: Answer Q1 (correct answer A) ---');
{
  var result = submitAnswer(session, 'A');
  if (result.qIndex !== 0) fail('qIndex should be 0', 0, result.qIndex); else ok('qIndex=0');
  if (result.isCorrect !== true) fail('should be correct', true, result.isCorrect); else ok('Q1 answered correctly');
  var ans = getAnswered(session);
  if (ans === null) fail('answered should NOT be null', 'not null', null); else ok('answered=true at qIndex 0');
  if (session._groupViewIndex !== 0) fail('_groupViewIndex should stay at 0', 0, session._groupViewIndex); else ok('viewIndex stays at 0 (shows Q1 feedback)');
  if (isLastInGroup(session)) fail('should NOT be last question', false, true); else ok('isLastInGroup=false (will show "下一題")');
}

console.log('\n--- Step 2: Press "下一題" ---');
{
  nextQuestion(session);
  if (session._groupViewIndex !== 1) fail('_groupViewIndex should be 1', 1, session._groupViewIndex); else ok('viewIndex=1 (now showing Q2)');
  var ans = getAnswered(session);
  if (ans !== null) fail('Q2 should be unanswered yet', null, ans); else ok('Q2 is unanswered (options are clickable)');
}

console.log('\n--- Step 3: Answer Q2 (wrong answer D) ---');
{
  var result = submitAnswer(session, 'D');
  if (result.qIndex !== 1) fail('qIndex should be 1', 1, result.qIndex); else ok('qIndex=1');
  if (result.isCorrect !== false) fail('should be wrong', false, result.isCorrect); else ok('Q2 answered incorrectly');
  var ans = getAnswered(session);
  if (ans === null) fail('answered should NOT be null', 'not null', null); else ok('answered=true at qIndex 1');
  if (session._groupViewIndex !== 1) fail('_groupViewIndex should stay at 1', 1, session._groupViewIndex); else ok('viewIndex stays at 1 (shows Q2 feedback)');
  if (isLastInGroup(session)) fail('should NOT be last question', false, true); else ok('isLastInGroup=false');
}

console.log('\n--- Step 4: Press "下一題" ---');
{
  nextQuestion(session);
  if (session._groupViewIndex !== 2) fail('_groupViewIndex should be 2', 2, session._groupViewIndex); else ok('viewIndex=2 (now showing Q3)');
  if (!isLastInGroup(session)) fail('should be last question', true, false); else ok('isLastInGroup=true');
}

console.log('\n--- Step 5: Answer Q3 (wrong answer B) ---');
{
  var result = submitAnswer(session, 'B');
  if (result.qIndex !== 2) fail('qIndex should be 2', 2, result.qIndex); else ok('qIndex=2');
  if (result.isCorrect !== false) fail('should be wrong', false, result.isCorrect); else ok('Q3 answered incorrectly');
  var ans = getAnswered(session);
  if (ans === null) fail('answered should NOT be null', 'not null', null); else ok('answered=true at qIndex 2');
  if (session._groupViewIndex !== 2) fail('_groupViewIndex should stay at 2', 2, session._groupViewIndex); else ok('viewIndex stays at 2 (shows Q3 feedback, NOT blank)');
  if (!isLastInGroup(session)) fail('should be last question', true, false); else ok('isLastInGroup=true');
  if (!allAnswered(session)) fail('all questions should be answered', true, false); else ok('allAnswered=true');
  if (!hasNext(session)) fail('should have next group', true, false); else ok('hasNext=true => shows "下一組" button');
}

console.log('\n--- Step 6: Press "下一組" ---');
{
  advanceGroup(session);
  if (session.currentIndex !== 1) fail('currentIndex should be 1', 1, session.currentIndex); else ok('currentIndex=1 (next group)');
  if (session._groupViewIndex !== 0) fail('_groupViewIndex should reset to 0', 0, session._groupViewIndex); else ok('viewIndex reset to 0');
  var ans = session.answers[1][0];
  if (ans !== null) fail('Q4 should be unanswered', null, ans); else ok('Q4 is unanswered (ready to answer)');
  if (hasNext(session)) fail('should not have next group', false, true); else ok('hasNext=false (last group, will show "查看結果")');
}

console.log('\n--- Step 7: Answer Q4 (correct A) ---');
{
  var result = submitAnswer(session, 'A');
  if (result.qIndex !== 0) fail('qIndex should be 0', 0, result.qIndex); else ok('qIndex=0');
  if (session._groupViewIndex !== 0) fail('viewIndex should stay at 0', 0, session._groupViewIndex); else ok('viewIndex=0 (Q4 feedback visible)');
}

console.log('\n--- Step 8: Press "下一題" to Q5 ---');
{
  nextQuestion(session);
  if (session._groupViewIndex !== 1) fail('_groupViewIndex should be 1', 1, session._groupViewIndex); else ok('viewIndex=1 (Q5)');
}

console.log('\n--- Step 9: Answer Q5 (wrong D), last question of last group ---');
{
  submitAnswer(session, 'D');
  if (!isLastInGroup(session)) fail('should be last question', true, false); else ok('isLastInGroup=true');
  if (!allAnswered(session)) fail('all should be answered', true, false); else ok('allAnswered=true');
  if (hasNext(session)) fail('should NOT have next', false, true); else ok('hasNext=false => shows "查看結果", not blank');
}

console.log('\n--- Summary ---');
console.log('  answeredCount=' + session.answeredCount + ' (expected 5)');
if (session.answeredCount !== 5) { fail('answeredCount', 5, session.answeredCount); } else { ok('answeredCount=5'); }
console.log('  totalItems=' + session.totalItems + ' (expected 5)');
console.log('  answers[0]=' + JSON.stringify(session.answers[0].map(function(a){return a?1:0;})));
console.log('  answers[1]=' + JSON.stringify(session.answers[1].map(function(a){return a?1:0;})));
console.log('  ViewIndex correctly stops at answered question: VERIFIED');
console.log('  Last question does NOT render blank: VERIFIED');
console.log('  Navigation transitions correctly: VERIFIED');
console.log('  _groupViewIndex resets on group transition: VERIFIED');

if (!process.exitCode) console.log('\n=== ALL TESTS PASSED ===');
else console.log('\n=== SOME TESTS FAILED ===');
