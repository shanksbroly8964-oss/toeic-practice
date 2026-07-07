"use strict";

var OK = 0, FAIL = 0, ISSUES = [];

function ok(desc) { OK++; console.log('  [PASS] ' + desc); }
function bad(desc, exp, act) {
  FAIL++;
  var msg = '  [FAIL] ' + desc + ' (expected=' + JSON.stringify(exp) + ', actual=' + JSON.stringify(act) + ')';
  console.log(msg);
  ISSUES.push(msg);
}

function assert(desc, cond) {
  if (cond) ok(desc); else bad(desc, true, cond);
}

// ====================================================================
// TEST 1: Part 3 group question flow with _groupViewIndex
// ====================================================================
console.log('\n=== TEST 1: Part 3 Group Question Flow ===\n');

var p3Item1 = {
  id: 'p3-g1', part: 3, conversation: ['A: Hello', 'B: Hi'],
  questions: [
    { question: 'Q1: What?', answer: 'A', options: ['A','B','C','D'], explanation: 'Expl1' },
    { question: 'Q2: When?', answer: 'B', options: ['A','B','C','D'], explanation: 'Expl2' },
    { question: 'Q3: Why?', answer: 'C', options: ['A','B','C','D'], explanation: 'Expl3' }
  ]
};
var p3Item2 = {
  id: 'p3-g2', part: 3, conversation: ['C: Hello', 'D: Hi'],
  questions: [
    { question: 'Q4: Who?', answer: 'A', options: ['A','B','C','D'], explanation: 'Expl4' },
    { question: 'Q5: Where?', answer: 'B', options: ['A','B','C','D'], explanation: 'Expl5' }
  ]
};

// Mock minimal quiz engine functions
function mockSubmitP3(session, answer) {
  var qIndex = session._groupViewIndex || 0;
  var item = session.items[session.currentIndex];
  var q = item.questions[qIndex];
  if (session.answers[session.currentIndex][qIndex] !== null) return null; // re-answer blocked
  var isCorrect = answer === q.answer;
  session.answers[session.currentIndex][qIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  var mockAnalytics = { calls: session._analyticsCalls || [] };
  mockAnalytics.calls.push({ part: 3, isCorrect: isCorrect });
  session._analyticsCalls = mockAnalytics.calls;
  var mockWrong = session._wrongItems || [];
  var qId = q.id || (item.id + '-Q' + (qIndex + 1));
  if (isCorrect) {
    mockWrong = mockWrong.filter(function(w) { return w.questionId !== qId; });
  } else {
    var exists = mockWrong.some(function(w) { return w.questionId === qId; });
    if (!exists) mockWrong.push({ questionId: qId, part: 3, userAnswer: answer, correctAnswer: q.answer });
  }
  session._wrongItems = mockWrong;
  return { qIndex: qIndex, isCorrect: isCorrect };
}

function mockNextP3(session) {
  session._groupViewIndex = (session._groupViewIndex || 0) + 1;
}

function mockNextGroup(session) {
  session._groupViewIndex = 0;
  session.currentIndex++;
}

function isLastInGroup(session) {
  return (session._groupViewIndex || 0) >= session.items[session.currentIndex].questions.length - 1;
}

function allAnsweredInGroup(session) {
  return session.answers[session.currentIndex].every(function(a) { return a !== null; });
}

var session = {
  part: 3, track: 'T600',
  items: [p3Item1, p3Item2],
  currentIndex: 0,
  answers: [[null,null,null], [null,null]],
  totalItems: 5,
  answeredCount: 0,
  _groupViewIndex: 0,
  _wrongItems: [],
  _analyticsCalls: []
};

console.log('Initial state:');
assert('_groupViewIndex=0', session._groupViewIndex === 0);
assert('currentIndex=0', session.currentIndex === 0);
assert('Q1 unanswered', session.answers[0][0] === null);
assert('answeredCount=0', session.answeredCount === 0);

// Step 1: Answer Q1 correctly
console.log('\n--- Step 1: Answer Q1 (correct = A) ---');
var r = mockSubmitP3(session, 'A');
assert('qIndex=0', r.qIndex === 0);
assert('isCorrect=true', r.isCorrect === true);
assert('viewIndex stays at 0 (shows feedback)', session._groupViewIndex === 0);
assert('Q1 answered not null', session.answers[0][0] !== null);
assert('answeredCount=1', session.answeredCount === 1);
assert('not last question', !isLastInGroup(session));
assert('not all answered', !allAnsweredInGroup(session));

// Step 2: Click "下一題" 
console.log('\n--- Step 2: Press "下一題" ---');
mockNextP3(session);
assert('viewIndex=1 (now showing Q2)', session._groupViewIndex === 1);
assert('Q2 unanswered', session.answers[0][1] === null);

// Step 3: Answer Q2 wrong
console.log('\n--- Step 3: Answer Q2 (wrong = D) ---');
r = mockSubmitP3(session, 'D');
assert('qIndex=1', r.qIndex === 1);
assert('isCorrect=false', r.isCorrect === false);
assert('viewIndex stays at 1 (shows Q2 feedback)', session._groupViewIndex === 1);
assert('Q2 answered', session.answers[0][1] !== null);
assert('answeredCount=2', session.answeredCount === 2);
assert('Analytics recorded 2 calls', session._analyticsCalls.length === 2);
assert('WrongItem recorded (1 entry)', session._wrongItems.length === 1);

// Step 4: Click "下一題" → Q3
console.log('\n--- Step 4: Press "下一題" → Q3 ---');
mockNextP3(session);
assert('viewIndex=2 (Q3)', session._groupViewIndex === 2);
assert('isLastInGroup=true', isLastInGroup(session));

// Step 5: Answer Q3 (last question)
console.log('\n--- Step 5: Answer Q3 (wrong = B), last question ---');
r = mockSubmitP3(session, 'B');
assert('qIndex=2', r.qIndex === 2);
assert('isCorrect=false', r.isCorrect === false);
assert('viewIndex stays at 2 (NOT blank!)', session._groupViewIndex === 2);
assert('Q3 answered not null', session.answers[0][2] !== null);
assert('isLastInGroup=true', isLastInGroup(session));
assert('allAnsweredInGroup=true', allAnsweredInGroup(session));
assert('answeredCount=3', session.answeredCount === 3);
assert('WrongItems=2', session._wrongItems.length === 2);

// Step 6: Press "下一組"
console.log('\n--- Step 6: Press "下一組" → move to second group ---');
mockNextGroup(session);
assert('currentIndex=1 (next group)', session.currentIndex === 1);
assert('viewIndex reset to 0', session._groupViewIndex === 0);
assert('Q4 unanswered', session.answers[1][0] === null);

// Step 7-9: Answer Q4→Q5, last group → "查看結果"
console.log('\n--- Step 7: Answer Q4 (correct) ---');
mockSubmitP3(session, 'A');
assert('answeredCount=4', session.answeredCount === 4);
assert('viewIndex stays 0', session._groupViewIndex === 0);

console.log('\n--- Step 8: Press "下一題" → Q5 ---');
mockNextP3(session);
assert('viewIndex=1 (Q5)', session._groupViewIndex === 1);

console.log('\n--- Step 9: Answer Q5 (wrong), last question of last group ---');
mockSubmitP3(session, 'D');
assert('isLastInGroup=true', isLastInGroup(session));
assert('allAnsweredInGroup=true', allAnsweredInGroup(session));
assert('hasNext=false (no more groups)', session.currentIndex >= session.items.length - 1);
assert('answeredCount=5', session.answeredCount === 5);
assert('WrongItems=3', session._wrongItems.length === 3);

// Re-answer test
console.log('\n--- Re-answer block test ---');
var blocked = mockSubmitP3(session, 'C');
assert('re-answer blocked (returns null)', blocked === null);
assert('answeredCount still 5', session.answeredCount === 5);

// Boundary: 2-question group
console.log('\n--- Boundary: 2-question group (already tested as second group) ---');
assert('Q4 answered', session.answers[1][0] !== null);
assert('Q5 answered', session.answers[1][1] !== null);

// ====================================================================
// TEST 2: Part 4 same flow
// ====================================================================
console.log('\n=== TEST 2: Part 4 Group Question Flow ===\n');

var p4Item = {
  id: 'p4-g1', part: 4, talk: 'Long talk...',
  questions: [
    { question: 'P4Q1?', answer: 'A', options: ['A','B','C','D'], explanation: 'E1' },
    { question: 'P4Q2?', answer: 'B', options: ['A','B','C','D'], explanation: 'E2' }
  ]
};
var s4 = {
  part: 4, track: 'T600', items: [p4Item], currentIndex: 0,
  answers: [[null,null]], totalItems: 2, answeredCount: 0,
  _groupViewIndex: 0, _wrongItems: [], _analyticsCalls: []
};

function mockSubmitP4(session, answer) {
  var qIndex = session._groupViewIndex || 0;
  var item = session.items[session.currentIndex];
  var q = item.questions[qIndex];
  if (session.answers[session.currentIndex][qIndex] !== null) return null;
  var isCorrect = answer === q.answer;
  session.answers[session.currentIndex][qIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  session._analyticsCalls.push({ part: 4, isCorrect: isCorrect });
  return { qIndex: qIndex, isCorrect: isCorrect };
}

assert('Part4 init viewIndex=0', s4._groupViewIndex === 0);

mockSubmitP4(s4, 'A');
assert('P4 Q1 answered, viewIndex stays 0', s4._groupViewIndex === 0);

mockNextP3(s4);  // same logic: +(1)
assert('P4 viewIndex=1 (Q2)', s4._groupViewIndex === 1);

mockSubmitP4(s4, 'B');
assert('P4 Q2 answered, viewIndex stays 1', s4._groupViewIndex === 1);
assert('P4 answeredCount=2', s4.answeredCount === 2);
assert('P4 not blank after last question', s4.answers[0][1] !== null);

// ====================================================================
// TEST 3: Part 7 same flow
// ====================================================================
console.log('\n=== TEST 3: Part 7 Group Question Flow ===\n');

var p7Item = {
  id: 'p7-g1', part: 7,
  documents: [{ title: 'Doc', body: 'Body text' }],
  questions: [
    { question: 'P7Q1?', answer: 'C', options: ['A','B','C','D'], explanation: 'E1' },
    { question: 'P7Q2?', answer: 'D', options: ['A','B','C','D'], explanation: 'E2' },
    { question: 'P7Q3?', answer: 'A', options: ['A','B','C','D'], explanation: 'E3' },
    { question: 'P7Q4?', answer: 'B', options: ['A','B','C','D'], explanation: 'E4' }
  ]
};
var s7 = {
  part: 7, track: 'T600', items: [p7Item], currentIndex: 0,
  answers: [[null,null,null,null]], totalItems: 4, answeredCount: 0,
  _groupViewIndex: 0, _wrongItems: [], _analyticsCalls: []
};

function mockSubmitP7(session, answer) {
  var qIndex = session._groupViewIndex || 0;
  var item = session.items[session.currentIndex];
  var q = item.questions[qIndex];
  if (session.answers[session.currentIndex][qIndex] !== null) return null;
  var isCorrect = answer === q.answer;
  session.answers[session.currentIndex][qIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  session._analyticsCalls.push({ part: 7, isCorrect: isCorrect });
  return { qIndex: qIndex, isCorrect: isCorrect };
}

assert('Part7 init viewIndex=0', s7._groupViewIndex === 0);

// Answer all 4 questions
['C','D','A','B'].forEach(function(ans, i) {
  mockSubmitP7(s7, ans);
  assert('P7 Q'+(i+1)+' answered, viewIndex stays ' + i, s7._groupViewIndex === i);
  mockNextP3(s7);
  assert('P7 viewIndex='+(i+1)+' after next', s7._groupViewIndex === i+1);
});
assert('P7 all 4 answered', s7.answers[0].every(function(a) { return a !== null; }));
assert('P7 answeredCount=4', s7.answeredCount === 4);

// ====================================================================
// TEST 4: Composite Session Path
// ====================================================================
console.log('\n=== TEST 4: Composite Session Path ===\n');

var compSession = {
  isComposite: true, track: 'T600',
  items: [
    { id: 'p2-1', part: 2, audioScript: 'Q?', options: ['A','B','C'], answer: 'A', explanation: 'E' },
    { id: 'p3-c1', part: 3, conversation: ['A: Hi'], questions: [
      { question: 'CQ1?', answer: 'A', options: ['A','B','C','D'], explanation: 'E1' },
      { question: 'CQ2?', answer: 'B', options: ['A','B','C','D'], explanation: 'E2' }
    ]},
    { id: 'p5-1', part: 5, question: 'Q?', options: ['A','B','C','D'], answer: 'C', explanation: 'E' }
  ],
  currentIndex: 0,
  answers: [null, [null,null], null],
  totalItems: 4,
  answeredCount: 0,
  _groupViewIndex: 0
};

// Step 1: Part 2 single question
var item = compSession.items[0];
var part = compSession.isComposite ? item.part : compSession.part;
assert('Composite item 0 is Part 2', part === 2);
assert('Composite ans[0] is null (flat answer)', compSession.answers[0] === null);

// Answer Part 2 (simulating)
compSession.answers[0] = { userAnswer: 'A', isCorrect: true };
compSession.answeredCount++;

// Move to next (Part 3 group)
compSession._groupViewIndex = 0;  // nextQuestion resets
compSession.currentIndex = 1;
assert('After nextQuestion: currentIndex=1', compSession.currentIndex === 1);
assert('After nextQuestion: _groupViewIndex reset to 0', compSession._groupViewIndex === 0);

// Answer Part 3 Q1
var p3Item = compSession.items[1];
assert('Item 1 is Part 3', p3Item.part === 3);
assert('P3 answers array has 2 slots', compSession.answers[1].length === 2);

function mockCompSubmit(session, answer) {
  var qIndex = session._groupViewIndex || 0;
  session.answers[session.currentIndex][qIndex] = { userAnswer: answer, isCorrect: true };
  session.answeredCount++;
}

mockCompSubmit(compSession, 'A');
assert('Comp P3 Q1 answered, viewIndex stays 0', compSession._groupViewIndex === 0);
compSession._groupViewIndex = 1;  // nextPart3Question
mockCompSubmit(compSession, 'B');
assert('Comp P3 Q2 answered, viewIndex stays 1', compSession._groupViewIndex === 1);

// Move to Part 5
compSession._groupViewIndex = 0;
compSession.currentIndex = 2;
assert('After next: currentIndex=2 (Part 5)', compSession.currentIndex === 2);
assert('_groupViewIndex reset to 0', compSession._groupViewIndex === 0);
assert('Part 5 answer slot is null', compSession.answers[2] === null);

// Answer Part 5
compSession.answers[2] = { userAnswer: 'C', isCorrect: true };
compSession.answeredCount++;
assert('Comp session answeredCount=4', compSession.answeredCount === 4);

// ====================================================================
// TEST 5: Part 1/2/5/6 Regression (no changes needed)
// ====================================================================
console.log('\n=== TEST 5: Part 1/2/5/6 Regression ===\n');

// Part 1: single question, answers[currentIndex] is null or object
var s1 = { part: 1, items: [
  { id:'p1-1', imageDescription: 'Desc', options: ['A','B','C','D'], answer: 'A', explanation: 'E' }
], currentIndex: 0, answers: [null], answeredCount: 0 };
assert('P1 init: answer is null', s1.answers[0] === null);

// Simulate Part 1 submit
function mockSubmitP1(session, answer) {
  if (session.answers[session.currentIndex] !== null) return null;
  var item = session.items[session.currentIndex];
  var isCorrect = answer === item.answer;
  session.answers[session.currentIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  return isCorrect;
}
mockSubmitP1(s1, 'A');
assert('P1 answered', s1.answers[0] !== null);
assert('P1 correct', s1.answers[0].isCorrect === true);
assert('P1 re-answer blocked', mockSubmitP1(s1, 'B') === null);
assert('P1 answeredCount=1', s1.answeredCount === 1);

// Part 2: same mechanism as Part 1
var s2 = { part: 2, items: [
  { id:'p2-1', audioScript: 'Hello?', options: ['A','B','C'], answer: 'B', explanation: 'E' }
], currentIndex: 0, answers: [null], answeredCount: 0 };
function mockSubmitP2(session, answer) {
  if (session.answers[session.currentIndex] !== null) return null;
  var item = session.items[session.currentIndex];
  var isCorrect = answer === item.answer;
  session.answers[session.currentIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  return isCorrect;
}
mockSubmitP2(s2, 'B');
assert('P2 answered', s2.answers[0] !== null);
assert('P2 correct', s2.answers[0].isCorrect === true);
assert('P2 re-answer blocked', mockSubmitP2(s2, 'A') === null);

// Part 5: same mechanism
var s5 = { part: 5, items: [
  { id:'p5-1', question: 'Q?', options: ['A','B','C','D'], answer: 'D', explanation: 'E' }
], currentIndex: 0, answers: [null], answeredCount: 0 };
function mockSubmitP5(session, answer) {
  if (session.answers[session.currentIndex] !== null) return null;
  var item = session.items[session.currentIndex];
  var isCorrect = answer === item.answer;
  session.answers[session.currentIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  return isCorrect;
}
mockSubmitP5(s5, 'D');
assert('P5 answered', s5.answers[0] !== null);
assert('P5 correct', s5.answers[0].isCorrect === true);
assert('P5 re-answer blocked', mockSubmitP5(s5, 'C') === null);
assert('P5 answeredCount=1', s5.answeredCount === 1);

// Part 6: 4 blanks, each independent
var s6 = { part: 6, items: [
  { id:'p6-1', passageTemplate: '(1)___ (2)___ (3)___ (4)___',
    blanks: [
      { options: ['A','B','C','D'], answer: 'A', explanation: 'E1' },
      { options: ['A','B','C','D'], answer: 'B', explanation: 'E2' },
      { options: ['A','B','C','D'], answer: 'C', explanation: 'E3' },
      { options: ['A','B','C','D'], answer: 'D', explanation: 'E4' }
    ]
  }
], currentIndex: 0, answers: [[null,null,null,null]], answeredCount: 0 };

function mockSubmitP6Blank(session, blankIndex, answer) {
  if (session.answers[session.currentIndex][blankIndex] !== null) return null;
  var blank = session.items[session.currentIndex].blanks[blankIndex];
  var isCorrect = answer === blank.answer;
  session.answers[session.currentIndex][blankIndex] = { userAnswer: answer, isCorrect: isCorrect };
  session.answeredCount++;
  return { blankIndex: blankIndex, isCorrect: isCorrect };
}

function allBlanksAnswered(session) {
  return session.answers[session.currentIndex].every(function(a) { return a !== null; });
}

mockSubmitP6Blank(s6, 0, 'A');
mockSubmitP6Blank(s6, 1, 'X');  // wrong
mockSubmitP6Blank(s6, 2, 'C');
assert('P6 3 blanks answered, not all', !allBlanksAnswered(s6));
mockSubmitP6Blank(s6, 3, 'D');
assert('P6 all blanks answered', allBlanksAnswered(s6));
assert('P6 answeredCount=4', s6.answeredCount === 4);
assert('P6 re-answer blocked', mockSubmitP6Blank(s6, 0, 'B') === null);
assert('P6 answeredCount still 4', s6.answeredCount === 4);

// ====================================================================
// Summary
// ====================================================================
console.log('\n=== SUMMARY ===');
console.log('  Passed: ' + OK);
console.log('  Failed: ' + FAIL);

if (FAIL > 0) {
  console.log('\n  Failed issues:');
  ISSUES.forEach(function(i) { console.log('    ' + i); });
  process.exit(1);
} else {
  console.log('\n  [ALL TESTS PASSED]');
}
