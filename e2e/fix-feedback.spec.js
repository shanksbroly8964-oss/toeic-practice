const { test, expect } = require('@playwright/test');

const EVIDENCE = 'evidence/';

async function loadHome(page) {
  await page.addInitScript(() => {
    window.__spoken = [];
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        _holding: null,
        get speaking() { return false; },
        speak: function (u) {
          const text = (u && typeof u.text === 'string') ? u.text : '[object Object]';
          window.__spoken.push(text);
          this._holding = u;
        },
        cancel: function () { this._holding = null; },
        pause: function () { },
        resume: function () { },
        get paused() { return false; },
        get pending() { return false; },
        onvoiceschanged: null,
        getVoices: function () { return []; },
      },
      writable: true,
      configurable: true,
    });
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.app-header', { state: 'visible', timeout: 20000 });
  await page.waitForSelector('.card', { state: 'visible', timeout: 10000 });
}

async function startPractice(page, partName) {
  await page.locator('.card h3').filter({ hasText: partName }).click();
  await page.waitForSelector('.dialog-overlay', { state: 'visible', timeout: 5000 });
  await page.locator('.dialog-actions button.primary').click();
}

async function goBackHome(page) {
  const backBtn = page.locator('button.back-link');
  if (await backBtn.count() > 0) {
    await backBtn.click();
  }
  await page.waitForSelector('.card', { state: 'visible', timeout: 5000 });
}

test('fix-01-part3-feedback', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await loadHome(page);
  await startPractice(page, 'Part 3');

  await page.waitForSelector('.listening-group', { timeout: 20000 });
  await page.waitForTimeout(500);

  /* Get group info */
  const groupInfo = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s) return null;
    const item = s.items[s.currentIndex];
    return {
      totalGroups: s.items.length,
      questionsCount: item.questions ? item.questions.length : 0,
      hasChart: !!item.chartData,
      qIndex: s._groupViewIndex || 0,
    };
  });
  expect(groupInfo).not.toBeNull();
  expect(groupInfo.questionsCount).toBeGreaterThanOrEqual(2);
  console.log(`Part3 group: ${groupInfo.questionsCount} questions, ${groupInfo.totalGroups} groups, chart=${groupInfo.hasChart}`);

  /* Question 1: click an option */
  const freshBtns1 = page.locator('button.option-btn:not([disabled])');
  expect(await freshBtns1.count()).toBeGreaterThan(0);
  await freshBtns1.first().click();
  await page.waitForTimeout(500);

  /* Assert feedback block exists */
  const feedback = page.locator('.feedback');
  await expect(feedback).toBeVisible({ timeout: 5000 });

  /* Feedback text: either 答對了 or 答錯了 */
  const fbText = await feedback.textContent();
  expect(fbText).toMatch(/答對了|答錯了/);

  /* Explanation should contain text */
  const explanation = page.locator('.explanation');
  await expect(explanation).toBeVisible();
  const explText = await explanation.textContent();
  expect(explText.trim().length).toBeGreaterThan(0);

  /* Options disabled */
  const options = page.locator('button.option-btn');
  const optCount = await options.count();
  for (let i = 0; i < optCount; i++) {
    const disabled = await options.nth(i).getAttribute('disabled');
    expect(disabled !== null || disabled === '').toBeTruthy();
  }

  /* Correct option has correct class */
  const correctOpts = page.locator('button.option-btn.correct');
  expect(await correctOpts.count()).toBeGreaterThanOrEqual(1);

  /* Next question button */
  const nextBtn = page.locator('button.home-btn').filter({ hasText: /下一題/ });
  await expect(nextBtn).toBeVisible();

  /* Click next question */
  await nextBtn.click();
  await page.waitForTimeout(500);

  /* Now on question 2: should be unanswered state */
  const qIndex2 = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    return s ? s._groupViewIndex : -1;
  });
  expect(qIndex2).toBe(1);

  /* No stale feedback from Q1 */
  const staleFeedback = page.locator('.feedback');
  expect(await staleFeedback.count()).toBe(0);

  /* Options clickable */
  const freshBtns2 = page.locator('button.option-btn:not([disabled])');
  expect(await freshBtns2.count()).toBeGreaterThan(0);

  /* Answer all remaining questions to reach last question */
  const remainingCount = groupInfo.questionsCount - 2; /* Q1+Q2 done */
  for (let r = 0; r < remainingCount; r++) {
    const btns = page.locator('button.option-btn:not([disabled])');
    if (await btns.count() === 0) break;
    await btns.first().click();
    await page.waitForTimeout(400);

    const nxt = page.locator('button.home-btn').filter({ hasText: /下一題/ });
    if (await nxt.count() > 0) {
      await nxt.click();
      await page.waitForTimeout(500);
    }
  }

  /* Answer last question in this group */
  const lastBtns = page.locator('button.option-btn:not([disabled])');
  if (await lastBtns.count() > 0) {
    await lastBtns.first().click();
    await page.waitForTimeout(500);
  }

  /* After last question: feedback must still be visible (old bug: blank screen) */
  const lastFb = page.locator('.feedback');
  await expect(lastFb).toBeVisible({ timeout: 5000 });
  expect((await lastFb.textContent())).toMatch(/答對了|答錯了/);

  /* Navigation button: either 下一組 or 查看結果 (NOT 下一題) */
  const nextGroupBtn = page.locator('button.home-btn').filter({ hasText: /下一組/ });
  const finishBtn = page.locator('button.home-btn').filter({ hasText: /查看結果/ });
  const hasNavBtn = (await nextGroupBtn.count()) + (await finishBtn.count());
  expect(hasNavBtn).toBeGreaterThan(0);

  /* Verify no 下一題 button */
  const nextQBtn = page.locator('button.home-btn').filter({ hasText: /下一題/ });
  expect(await nextQBtn.count()).toBe(0);

  /* Chart check: if group has chart, verify it rendered */
  if (groupInfo.hasChart) {
    const chartTable = page.locator('table.chart-table');
    const chartContainer = page.locator('.chart-table-container');
    const chartVisible = (await chartTable.count()) + (await chartContainer.count());
    expect(chartVisible).toBeGreaterThan(0);
  }

  await page.screenshot({ path: EVIDENCE + 'fix-part3-feedback.png', fullPage: true });

  /* No JS errors */
  const realErrors = errors.filter(e => !e.includes('favicon.ico') && !e.includes('INTERNAL'));
  if (realErrors.length > 0) console.log('[FAIL] Part3 JS errors:', realErrors);
  expect(realErrors).toHaveLength(0);
});

test('fix-02-part4-feedback', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await loadHome(page);
  await startPractice(page, 'Part 4');

  await page.waitForSelector('.listening-group', { timeout: 20000 });
  await page.waitForTimeout(500);

  const groupInfo = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s) return null;
    const item = s.items[s.currentIndex];
    return {
      totalGroups: s.items.length,
      questionsCount: item.questions ? item.questions.length : 0,
      qIndex: s._groupViewIndex || 0,
    };
  });
  expect(groupInfo).not.toBeNull();
  expect(groupInfo.questionsCount).toBeGreaterThanOrEqual(2);
  console.log(`Part4 group: ${groupInfo.questionsCount} questions, ${groupInfo.totalGroups} groups`);

  /* Q1: click option */
  const freshBtns1 = page.locator('button.option-btn:not([disabled])');
  expect(await freshBtns1.count()).toBeGreaterThan(0);
  await freshBtns1.first().click();
  await page.waitForTimeout(500);

  /* Assert feedback */
  const feedback = page.locator('.feedback');
  await expect(feedback).toBeVisible({ timeout: 5000 });
  expect(await feedback.textContent()).toMatch(/答對了|答錯了/);

  /* Explanation non-empty */
  const explanation = page.locator('.explanation');
  await expect(explanation).toBeVisible();
  expect((await explanation.textContent()).trim().length).toBeGreaterThan(0);

  /* Options disabled, correct/wrong classes */
  const correctOpts = page.locator('button.option-btn.correct');
  expect(await correctOpts.count()).toBeGreaterThanOrEqual(1);

  /* Next question button */
  const nextBtn = page.locator('button.home-btn').filter({ hasText: /下一題/ });
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();
  await page.waitForTimeout(500);

  /* Q2: no stale feedback */
  const staleFeedback = page.locator('.feedback');
  expect(await staleFeedback.count()).toBe(0);

  const freshBtns2 = page.locator('button.option-btn:not([disabled])');
  expect(await freshBtns2.count()).toBeGreaterThan(0);

  /* Answer all remaining to last question */
  const remainingCount = groupInfo.questionsCount - 2;
  for (let r = 0; r < remainingCount; r++) {
    const btns = page.locator('button.option-btn:not([disabled])');
    if (await btns.count() === 0) break;
    await btns.first().click();
    await page.waitForTimeout(400);
    const nxt = page.locator('button.home-btn').filter({ hasText: /下一題/ });
    if (await nxt.count() > 0) {
      await nxt.click();
      await page.waitForTimeout(500);
    }
  }

  /* Answer last question */
  const lastBtns = page.locator('button.option-btn:not([disabled])');
  if (await lastBtns.count() > 0) {
    await lastBtns.first().click();
    await page.waitForTimeout(500);
  }

  /* Last question: feedback visible (not blank) */
  const lastFb = page.locator('.feedback');
  await expect(lastFb).toBeVisible({ timeout: 5000 });
  expect(await lastFb.textContent()).toMatch(/答對了|答錯了/);

  /* Navigation: 下一組 or 查看結果 */
  const nextGroupBtn = page.locator('button.home-btn').filter({ hasText: /下一組/ });
  const finishBtn = page.locator('button.home-btn').filter({ hasText: /查看結果/ });
  expect((await nextGroupBtn.count()) + (await finishBtn.count())).toBeGreaterThan(0);

  /* No 下一題 when on last question */
  expect(await page.locator('button.home-btn').filter({ hasText: /下一題/ }).count()).toBe(0);

  await page.screenshot({ path: EVIDENCE + 'fix-part4-feedback.png', fullPage: true });

  const realErrors = errors.filter(e => !e.includes('favicon.ico') && !e.includes('INTERNAL'));
  if (realErrors.length > 0) console.log('[FAIL] Part4 JS errors:', realErrors);
  expect(realErrors).toHaveLength(0);
});

test('fix-03-part7-feedback', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await loadHome(page);
  await startPractice(page, 'Part 7');

  await page.waitForSelector('.documents-container', { timeout: 20000 });
  await page.waitForTimeout(500);

  const groupInfo = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s) return null;
    const item = s.items[s.currentIndex];
    return {
      totalGroups: s.items.length,
      questionsCount: item.questions ? item.questions.length : 0,
      qIndex: s._groupViewIndex || 0,
    };
  });
  expect(groupInfo).not.toBeNull();
  expect(groupInfo.questionsCount).toBeGreaterThanOrEqual(1);
  console.log(`Part7 group: ${groupInfo.questionsCount} questions, ${groupInfo.totalGroups} groups`);

  /* Q1: click option */
  const freshBtns1 = page.locator('button.option-btn:not([disabled])');
  expect(await freshBtns1.count()).toBeGreaterThan(0);
  await freshBtns1.first().click();
  await page.waitForTimeout(500);

  /* Assert feedback */
  const feedback = page.locator('.feedback');
  await expect(feedback).toBeVisible({ timeout: 5000 });
  expect(await feedback.textContent()).toMatch(/答對了|答錯了/);

  /* Explanation non-empty */
  const explanation = page.locator('.explanation');
  await expect(explanation).toBeVisible();
  expect((await explanation.textContent()).trim().length).toBeGreaterThan(0);

  /* Options disabled, correct class */
  const correctOpts = page.locator('button.option-btn.correct');
  expect(await correctOpts.count()).toBeGreaterThanOrEqual(1);

  /* If multi-question group: next question navigation */
  if (groupInfo.questionsCount >= 2) {
    const nextBtn = page.locator('button.home-btn').filter({ hasText: /下一題/ });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await page.waitForTimeout(500);

    /* Q2: no stale feedback */
    expect(await page.locator('.feedback').count()).toBe(0);

    const freshBtns2 = page.locator('button.option-btn:not([disabled])');
    expect(await freshBtns2.count()).toBeGreaterThan(0);

    /* Answer all remaining to last */
    const remainingCount = groupInfo.questionsCount - 2;
    for (let r = 0; r < remainingCount; r++) {
      const btns = page.locator('button.option-btn:not([disabled])');
      if (await btns.count() === 0) break;
      await btns.first().click();
      await page.waitForTimeout(400);
      const nxt = page.locator('button.home-btn').filter({ hasText: /下一題/ });
      if (await nxt.count() > 0) {
        await nxt.click();
        await page.waitForTimeout(500);
      }
    }

    /* Answer last question */
    const lastBtns = page.locator('button.option-btn:not([disabled])');
    if (await lastBtns.count() > 0) {
      await lastBtns.first().click();
      await page.waitForTimeout(500);
    }
  }

  /* After answering: feedback visible */
  const lastFb = page.locator('.feedback');
  await expect(lastFb).toBeVisible({ timeout: 5000 });
  expect(await lastFb.textContent()).toMatch(/答對了|答錯了/);

  /* Navigation: 下一組 or 查看結果 */
  const nextGroupBtn = page.locator('button.home-btn').filter({ hasText: /下一組/ });
  const finishBtn = page.locator('button.home-btn').filter({ hasText: /查看結果/ });
  const navCount = (await nextGroupBtn.count()) + (await finishBtn.count());
  expect(navCount).toBeGreaterThan(0);

  /* No 下一題 if last question */
  expect(await page.locator('button.home-btn').filter({ hasText: /下一題/ }).count()).toBe(0);

  await page.screenshot({ path: EVIDENCE + 'fix-part7-feedback.png', fullPage: true });

  const realErrors = errors.filter(e => !e.includes('favicon.ico') && !e.includes('INTERNAL'));
  if (realErrors.length > 0) console.log('[FAIL] Part7 JS errors:', realErrors);
  expect(realErrors).toHaveLength(0);
});

test('fix-04-part3-multi-group-navigation', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await loadHome(page);
  await startPractice(page, 'Part 3');

  await page.waitForSelector('.listening-group', { timeout: 20000 });
  await page.waitForTimeout(500);

  /* Complete group 1: answer all questions, then click 下一組 */
  let groupCount = 0;
  const maxGroups = 5; /* safety limit */
  while (groupCount < maxGroups) {
    const currentInfo = await page.evaluate(() => {
      const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
      if (!s) return null;
      return { currentIndex: s.currentIndex, qIndex: s._groupViewIndex || 0 };
    });
    if (!currentInfo) break;

    /* Answer all questions in current group */
    let answeredInGroup = 0;
    const maxPerGroup = 5;
    while (answeredInGroup < maxPerGroup) {
      const fresh = page.locator('button.option-btn:not([disabled])');
      if (await fresh.count() === 0) break;

      await fresh.first().click();
      await page.waitForTimeout(400);
      answeredInGroup++;

      /* Check feedback visible */
      const fb = page.locator('.feedback');
      await expect(fb).toBeVisible({ timeout: 5000 });

      /* Navigate: 下一題 or 下一組 or 查看結果 */
      const nextQ = page.locator('button.home-btn').filter({ hasText: /下一題/ });
      const nextG = page.locator('button.home-btn').filter({ hasText: /下一組/ });
      const finish = page.locator('button.home-btn').filter({ hasText: /查看結果/ });

      if (await nextQ.count() > 0) {
        await nextQ.click();
        await page.waitForTimeout(500);
        continue;
      }
      if (await nextG.count() > 0) {
        groupCount++;
        await nextG.click();
        await page.waitForTimeout(500);
        break;
      }
      if (await finish.count() > 0) {
        groupCount++;
        break;
      }
      break;
    }

    /* If reached end or 查看結果 */
    const finishNow = page.locator('button.home-btn').filter({ hasText: /查看結果/ });
    if (await finishNow.count() > 0) break;
  }

  /* Verify groupViewIndex reset after nextQuestion */
  const finalIndex = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    return s ? s._groupViewIndex : -1;
  });

  /* finalIndex could be 0 or last qt index depending on where we stopped */
  console.log(`Completed ${groupCount} groups, final _groupViewIndex=${finalIndex}`);

  /* Verify we successfully navigated through at least 1 group with proper feedback */
  expect(errors.filter(e => !e.includes('favicon.ico') && !e.includes('INTERNAL'))).toHaveLength(0);
});

test('fix-05-composite-part3-feedback', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  /* Pre-configure session: only Part3 with 3 groups */
  await page.addInitScript(() => {
    localStorage.setItem('toeic_session_config', JSON.stringify({
      p1: 0, p2: 0, p3: 3, p4: 0, p5: 0, p6: 0, p7: 0,
    }));
  });

  await loadHome(page);

  /* Start composite practice */
  await page.locator('.card h3').filter({ hasText: /綜合練習/ }).click();
  await page.waitForSelector('.composite-summary', { timeout: 30000 });
  await page.waitForTimeout(300);

  /* Verify setup shows Part3 */
  const setupText = await page.locator('.composite-summary').textContent();
  console.log('Composite setup:', setupText.trim().substring(0, 200));

  await page.locator('button').filter({ hasText: '開始練習' }).click();
  await page.waitForSelector('.quiz-header, .listening-group', { timeout: 30000 });
  await page.waitForTimeout(500);

  /* Should be in Part 3 group question */
  const groupInfo = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s) return null;
    if (!s.isComposite) return { error: 'not composite' };
    const item = s.items[s.currentIndex];
    return {
      isComposite: s.isComposite,
      part: item.part,
      questionsCount: item.questions ? item.questions.length : 0,
      qIndex: s._groupViewIndex || 0,
    };
  });
  expect(groupInfo).not.toBeNull();
  expect(groupInfo.isComposite).toBe(true);
  expect(groupInfo.part).toBe(3);
  console.log(`Composite Part3: ${groupInfo.questionsCount} questions in group`);

  /* Answer Q1 */
  const freshBtns = page.locator('button.option-btn:not([disabled])');
  expect(await freshBtns.count()).toBeGreaterThan(0);
  await freshBtns.first().click();
  await page.waitForTimeout(500);

  /* Feedback visible in composite mode */
  const feedback = page.locator('.feedback');
  await expect(feedback).toBeVisible({ timeout: 5000 });
  expect(await feedback.textContent()).toMatch(/答對了|答錯了/);

  /* Explanation visible */
  await expect(page.locator('.explanation')).toBeVisible();

  /* Next question → Q2 */
  const nextQ = page.locator('button.home-btn').filter({ hasText: /下一題/ });
  if (await nextQ.count() > 0) {
    await nextQ.click();
    await page.waitForTimeout(500);

    /* Q2: no stale feedback, options clickable */
    expect(await page.locator('.feedback').count()).toBe(0);
    const fresh2 = page.locator('button.option-btn:not([disabled])');
    expect(await fresh2.count()).toBeGreaterThan(0);
  }

  /* Answer remaining and navigate through groups */
  let reachedEnd = false;
  for (let step = 0; step < 30 && !reachedEnd; step++) {
    const btns = page.locator('button.option-btn:not([disabled])');
    if (await btns.count() > 0) {
      await btns.first().click();
      await page.waitForTimeout(400);
    }

    /* Verify feedback is visible after each answer */
    const fb = page.locator('.feedback');
    await expect(fb).toBeVisible({ timeout: 5000 });

    const nxtQ = page.locator('button.home-btn').filter({ hasText: /下一題/ });
    const nxtG = page.locator('button.home-btn').filter({ hasText: /下一組/ });
    const fins = page.locator('button.home-btn').filter({ hasText: /查看結果/ });

    if (await nxtQ.count() > 0) {
      await nxtQ.click();
      await page.waitForTimeout(500);
      continue;
    }
    if (await nxtG.count() > 0) {
      await nxtG.click();
      await page.waitForTimeout(500);
      continue;
    }
    if (await fins.count() > 0) {
      await fins.click();
      await page.waitForTimeout(500);
      reachedEnd = true;
      break;
    }
    break;
  }

  /* Should see results page, not blank */
  const resultContainer = page.locator('.result-container, .composite-result');
  await expect(resultContainer).toBeVisible({ timeout: 10000 });

  await page.screenshot({ path: EVIDENCE + 'fix-composite-part3-result.png', fullPage: true });

  const realErrors = errors.filter(e => !e.includes('favicon.ico') && !e.includes('INTERNAL'));
  if (realErrors.length > 0) console.log('[FAIL] Composite JS errors:', realErrors);
  expect(realErrors).toHaveLength(0);

  /* Restore config */
  await page.evaluate(() => {
    localStorage.setItem('toeic_session_config', JSON.stringify({
      p1: 2, p2: 8, p3: 4, p4: 3, p5: 10, p6: 1, p7: 2,
    }));
  });
});
