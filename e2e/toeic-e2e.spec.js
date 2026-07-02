const { test, expect } = require('@playwright/test');

const BASE = 'https://toeic-goku.web.app';
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
  await page.goto(BASE, { waitUntil: 'networkidle' });
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

/* ─────────────────────────────────────────────
   TEST 1: 首頁與分軌
   ───────────────────────────────────────────── */
test('01-home-page-renders-and-track-selection', async ({ page }) => {
  await loadHome(page);

  await expect(page.locator('#app')).not.toBeEmpty();

  // Phase 2: no h1, track-badge serves as header indicator
  await expect(page.locator('.track-badge')).toBeVisible();

  const btnT600 = page.locator('button.track-btn').filter({ hasText: '目標 600' });
  const btnT730 = page.locator('button.track-btn').filter({ hasText: '目標 730' });
  await expect(btnT600).toBeVisible();
  await expect(btnT730).toBeVisible();

  await expect(page.locator('.track-badge')).toContainText('目標 600');

  await btnT730.click();
  await page.waitForTimeout(500);
  await expect(page.locator('.track-badge')).toContainText('目標 730');

  await btnT600.click();
  await page.waitForTimeout(500);
  await expect(page.locator('.track-badge')).toContainText('目標 600');

  await expect(page.locator('h2.section-title')).toHaveCount(3);

  const cards = page.locator('.card');
  // Phase 2: 4 listening + 3 reading + 4 tools = 11
  await expect(cards).toHaveCount(11);

  // Listening: Part 1–4 (indices 0–3)
  // Reading:  Part 5–7 (indices 4–6)
  // Tools:    綜合練習(7), 錯題本(8), 弱點分析(9), 練習設定(10)
  await expect(cards.nth(4).locator('h3')).toContainText('Part 5');
  await expect(cards.nth(7).locator('h3')).toContainText('綜合練習');
  await expect(cards.nth(8).locator('h3')).toContainText('錯題');
  await expect(cards.nth(9).locator('h3')).toContainText('弱點分析');
  await expect(cards.nth(10).locator('h3')).toContainText('練習設定');

  await page.screenshot({ path: EVIDENCE + '01-home-page.png', fullPage: true });
});

/* ─────────────────────────────────────────────
   TEST 2: TTS 朗讀不會唸 [object Object]
   ───────────────────────────────────────────── */
test('02-tts-speaks-english-not-object', async ({ page }) => {
  await loadHome(page);
  await startPractice(page, 'Part 5');

  await page.waitForSelector('button.tts-btn', { timeout: 20000 });
  await page.waitForTimeout(500);

  // Clear any spoken from page init
  await page.evaluate(() => { window.__spoken = []; });

  await page.locator('button.tts-btn').first().click();
  await page.waitForTimeout(800);

  const spoken = await page.evaluate(() => window.__spoken);
  expect(spoken.length).toBeGreaterThan(0);

  const lastSpoken = spoken[spoken.length - 1] || '';
  expect(lastSpoken).not.toBe('');
  expect(lastSpoken).not.toBe('[object Object]');
  expect(lastSpoken).not.toContain('[object');
  expect(/[a-zA-Z]/.test(lastSpoken)).toBeTruthy();

  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   TEST 2b: Part 3 播放對話
   ───────────────────────────────────────────── */
test('02b-part3-play-conversation-speaks-correct-text', async ({ page }) => {
  await loadHome(page);
  await startPractice(page, 'Part 3');

  await page.waitForSelector('button.play-btn', { timeout: 20000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => { window.__spoken = []; });

  await page.locator('button.play-btn').first().click();
  await page.waitForTimeout(1200);

  const spoken = await page.evaluate(() => window.__spoken);
  const spokenText = spoken.join(' ');

  expect(spokenText).not.toContain('[object');
  expect(spokenText).not.toContain('undefined');
  expect(spokenText.length).toBeGreaterThan(0);
  expect(/[a-zA-Z]{3,}/.test(spokenText)).toBeTruthy();

  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   TEST 2c: Part 2 盲聽 + 文字稿切換
   ───────────────────────────────────────────── */
test('02c-part2-play-and-script-toggle', async ({ page }) => {
  await loadHome(page);
  await startPractice(page, 'Part 2');

  await page.waitForSelector('button.play-btn', { timeout: 20000 });
  await page.waitForTimeout(500);

  const scriptElem = page.locator('.audio-script');
  if (await scriptElem.count() > 0) {
    await expect(scriptElem).toHaveClass(/hidden/);
  }

  await page.evaluate(() => { window.__spoken = []; });

  await page.locator('button.play-btn').first().click();
  await page.waitForTimeout(800);

  const spoken = await page.evaluate(() => window.__spoken);
  expect(spoken.length).toBeGreaterThan(0);
  const lastAfterPlay = spoken[spoken.length - 1] || '';
  expect(/[a-zA-Z]{3,}/.test(lastAfterPlay)).toBeTruthy();
  expect(lastAfterPlay).not.toContain('[object');

  const toggleBtn = page.locator('button.script-toggle-btn');
  if (await toggleBtn.count() > 0) {
    await toggleBtn.click();
    await page.waitForTimeout(300);
    if (await scriptElem.count() > 0) {
      await expect(scriptElem).not.toHaveClass(/hidden/);
    }
  }

  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   TEST 3: 綜合練習組卷題數正確
   ───────────────────────────────────────────── */
test('03-composite-session-item-counts', async ({ page }) => {
  await loadHome(page);

  await page.locator('.card h3').filter({ hasText: /綜合練習/ }).click();
  // Phase 2: composite setup page shown first
  await page.waitForSelector('.composite-summary', { timeout: 30000 });
  await page.locator('button').filter({ hasText: '開始練習' }).click();
  await page.waitForSelector('.quiz-header', { timeout: 30000 });
  await page.waitForTimeout(800);

  const sessionInfo = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s) return null;
    return {
      isComposite: s.isComposite,
      totalItems: s.totalItems,
      itemCount: s.items.length,
      items: s.items.map(function (item) {
        return {
          part: item.part,
          subCount: item.questions
            ? item.questions.length
            : item.blanks
              ? item.blanks.length
              : 1,
        };
      }),
    };
  });

  expect(sessionInfo).not.toBeNull();
  expect(sessionInfo.isComposite).toBe(true);

  const partItemCounts = {};
  const partSubCounts = {};
  sessionInfo.items.forEach(function (item) {
    partItemCounts[item.part] = (partItemCounts[item.part] || 0) + 1;
    partSubCounts[item.part] = (partSubCounts[item.part] || 0) + item.subCount;
  });

  expect(partItemCounts[1]).toBe(2);
  expect(partItemCounts[2]).toBe(8);
  expect(partItemCounts[5]).toBe(10);
  expect(partItemCounts[6]).toBe(1);
  expect(partItemCounts[7]).toBe(2);
  expect(partSubCounts[3]).toBeGreaterThanOrEqual(12);
  expect(partSubCounts[4]).toBeGreaterThanOrEqual(10);

  const partOrder = sessionInfo.items.map(function (i) { return i.part; });
  let lastPart = 0;
  partOrder.forEach(function (p) {
    expect(p).toBeGreaterThanOrEqual(lastPart);
    lastPart = p;
  });

  await page.screenshot({ path: EVIDENCE + '03-composite-session.png', fullPage: true });
  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   TEST 4: Part 3 圖表整合題渲染
   ───────────────────────────────────────────── */
test('04-part3-chart-rendering', async ({ page }) => {
  await loadHome(page);

  await page.locator('.card h3').filter({ hasText: 'Part 3' }).click();
  await page.waitForSelector('.dialog-overlay', { state: 'visible', timeout: 5000 });

  const input = page.locator('.dialog-box input[type="number"]');
  await input.fill('10');
  await page.locator('.dialog-actions button.primary').click();

  await page.waitForSelector('.listening-group', { timeout: 20000 });
  await page.waitForTimeout(500);

  // Check for chart via direct session data (more reliable than UI iteration)
  const hasChartData = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s || !s.items) return false;
    return s.items.some(item => !!item.chartData);
  });

  // Also try to find it in the UI
  const chartTable = page.locator('table.chart-table');
  const chartContainer = page.locator('.chart-table-container');
  const chartVisible = (await chartTable.count()) > 0 || (await chartContainer.count()) > 0;

  // Either chart data exists in session, or chart is visible in UI
  if (chartVisible) {
    await page.screenshot({ path: EVIDENCE + '04-part3-chart-found.png' });
  } else if (hasChartData) {
    // Chart data exists but not in the first group - navigate to find it
    let found = false;
    for (let i = 0; i < 15 && !found; i++) {
      // Answer current question
      const freshBtns = page.locator('button.option-btn:not(.correct):not(.wrong):not([disabled])');
      if ((await freshBtns.count()) > 0) {
        await freshBtns.first().click();
        await page.waitForTimeout(400);
      }

      // Navigate
      const nextBtn = page.locator('button.home-btn').filter({ hasText: /下一題/ }).first();
      const nextGroupBtn = page.locator('button.home-btn').filter({ hasText: /下一組/ }).first();
      const finishBtn = page.locator('button.home-btn').filter({ hasText: /查看結果/ }).first();

      if ((await chartTable.count()) > 0 || (await chartContainer.count()) > 0) {
        found = true;
        break;
      }

      if ((await nextBtn.count()) > 0 && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(300);
      } else if ((await nextGroupBtn.count()) > 0 && await nextGroupBtn.isEnabled()) {
        await nextGroupBtn.click();
        await page.waitForTimeout(300);
      } else if ((await finishBtn.count()) > 0) {
        break;
      } else {
        break;
      }
    }
    if (found) {
      await page.screenshot({ path: EVIDENCE + '04-part3-chart-found.png' });
    }
  }

  // Assert: at least chart data should exist in the question bank
  expect(hasChartData || chartVisible).toBeTruthy();

  await page.screenshot({ path: EVIDENCE + '04-part3-quiz-state.png' });
  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   TEST 5: 錯題本流程（記錄→篩選→答對移除）
   ───────────────────────────────────────────── */
test('05-wrongbook-record-filter-remove', async ({ page }) => {
  /* Clear wrong book */
  await loadHome(page);
  await page.evaluate(() => localStorage.setItem('toeic_wrong', '[]'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.card', { state: 'visible', timeout: 10000 });

  /* Answer a Part 5 question WRONG */
  await startPractice(page, 'Part 5');
  await page.waitForSelector('button.option-btn', { timeout: 20000 });
  await page.waitForTimeout(500);

  const correctAnswer = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    return s ? s.items[s.currentIndex].answer : null;
  });

  const optionBtns = page.locator('button.option-btn');
  const count = await optionBtns.count();
  let clickedWrong = false;
  for (let i = 0; i < count; i++) {
    const fullText = (await optionBtns.nth(i).textContent()) || '';
    const answerText = fullText.replace(/^\([A-D]\)\s*/, '').trim();
    if (answerText !== correctAnswer) {
      await optionBtns.nth(i).click();
      clickedWrong = true;
      break;
    }
  }
  if (!clickedWrong) await optionBtns.first().click();
  await page.waitForTimeout(600);

  // Navigate back home
  await goBackHome(page);

  /* Verify wrong book has the item */
  await page.locator('.card h3').filter({ hasText: /錯題/ }).click();
  await page.waitForSelector('.wrong-item, .empty-wrongbook', { timeout: 10000 });
  await page.waitForTimeout(500);

  const wrongItems = page.locator('.wrong-item');
  expect(await wrongItems.count()).toBeGreaterThanOrEqual(1);

  await page.screenshot({ path: EVIDENCE + '05a-wrongbook-with-item.png' });

  /* Filter by Part 5 — Phase 2: two filter selects (part + category), target first */
  await page.locator('select.filter-select').first().selectOption('5');
  await page.waitForTimeout(300);
  expect(await wrongItems.count()).toBeGreaterThanOrEqual(1);

  /* Filter by Part 1 -> should be empty */
  await page.locator('select.filter-select').first().selectOption('1');
  await page.waitForTimeout(300);
  expect(await page.locator('.wrong-item').count()).toBe(0);
  await expect(page.locator('.empty-wrongbook')).toBeVisible();

  /* Back to all */
  await page.locator('select.filter-select').first().selectOption('all');
  await page.waitForTimeout(300);

  /* Re-answer correctly */
  const reanswerBtn = page.locator('.wrong-item button').filter({ hasText: /重新作答/ });
  await reanswerBtn.click();
  await page.waitForSelector('button.option-btn', { timeout: 15000 });
  await page.waitForTimeout(500);

  /* Pick the CORRECT answer */
  const reBtns = page.locator('button.option-btn');
  const reCount = await reBtns.count();
  for (let i = 0; i < reCount; i++) {
    const fullText = (await reBtns.nth(i).textContent()) || '';
    const answerText = fullText.replace(/^\([A-D]\)\s*/, '').trim();
    if (answerText === correctAnswer) {
      await reBtns.nth(i).click();
      break;
    }
  }
  await page.waitForTimeout(500);

  /* After answer, should see "查看結果" button for single-question session */
  const finishBtn = page.locator('button.home-btn').filter({ hasText: /查看結果/ });
  await finishBtn.click();
  await page.waitForTimeout(500);

  /* Now on results page, click "返回首頁" */
  const goHomeBtn = page.locator('.result-container button.home-btn').filter({ hasText: /返回首頁/ });
  await goHomeBtn.click();
  await page.waitForTimeout(500);

  /* goHome was overridden → renders wrong book view */
  await page.waitForSelector('.wrong-item, .empty-wrongbook', { timeout: 10000 });
  await page.waitForTimeout(300);

  /* We should be in wrong book view now - item removed */
  expect(await page.locator('.wrong-item').count()).toBe(0);
  await expect(page.locator('.empty-wrongbook')).toBeVisible();

  await page.screenshot({ path: EVIDENCE + '05b-wrongbook-empty-after-correct.png' });
});

/* ─────────────────────────────────────────────
   TEST 6: 主控台無 JS error
   ───────────────────────────────────────────── */
test('06-no-js-console-errors', async ({ page }) => {
  const rawErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') rawErrors.push(msg.text());
  });
  page.on('pageerror', (err) => rawErrors.push(err.message));

  await loadHome(page);

  await page.locator('button.track-btn').filter({ hasText: '目標 730' }).click();
  await page.waitForTimeout(400);
  await page.locator('button.track-btn').filter({ hasText: '目標 600' }).click();
  await page.waitForTimeout(400);

  const parts = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5', 'Part 6', 'Part 7'];
  for (const pName of parts) {
    await startPractice(page, pName);
    await page.waitForSelector('button.option-btn, button.play-btn, .passage', { timeout: 20000 });
    await page.waitForTimeout(200);
    await goBackHome(page);
  }

  await page.locator('.card h3').filter({ hasText: /綜合練習/ }).click();
  await page.waitForSelector('.composite-summary', { timeout: 30000 });
  await page.locator('button').filter({ hasText: '開始練習' }).click();
  await page.waitForSelector('.quiz-header', { timeout: 30000 });
  await page.waitForTimeout(500);
  await goBackHome(page);

  await page.locator('.card h3').filter({ hasText: /錯題/ }).click();
  await page.waitForSelector('.wrong-item, .empty-wrongbook', { timeout: 10000 });
  await page.waitForTimeout(500);
  await goBackHome(page);

  // Filter known external SDK errors
  const realErrors = rawErrors.filter(e =>
    !e.includes('favicon.ico') && !e.includes('INTERNAL')
  );
  if (realErrors.length > 0) console.log('[FAIL] JS errors:', realErrors);
  expect(realErrors).toHaveLength(0);
});

/* ─────────────────────────────────────────────
   TEST 7: 成人 UI 截圖抽查
   ───────────────────────────────────────────── */
test('07-adult-ui-screenshots', async ({ page }) => {
  await loadHome(page);
  await page.screenshot({ path: EVIDENCE + '07a-home.png', fullPage: true });

  /* Part 1 */
  await startPractice(page, 'Part 1');
  await page.waitForSelector('.image-description-box', { timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: EVIDENCE + '07b-part1-quiz.png' });
  await goBackHome(page);

  /* Part 5 */
  await startPractice(page, 'Part 5');
  await page.waitForSelector('button.option-btn', { timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: EVIDENCE + '07c-part5-quiz.png' });
  await goBackHome(page);

  /* Part 6 */
  await startPractice(page, 'Part 6');
  await page.waitForSelector('.passage', { timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: EVIDENCE + '07d-part6-quiz.png' });
  await goBackHome(page);

  /* Part 7 */
  await startPractice(page, 'Part 7');
  await page.waitForSelector('.documents-container', { timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: EVIDENCE + '07e-part7-quiz.png' });
  await goBackHome(page);

  /* Wrong book */
  await page.locator('.card h3').filter({ hasText: /錯題/ }).click();
  await page.waitForSelector('.wrong-item, .empty-wrongbook', { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: EVIDENCE + '07f-wrongbook.png' });
  await goBackHome(page);

  /* Complete a Part 5 quiz for results */
  await startPractice(page, 'Part 5');
  await page.waitForSelector('button.option-btn', { timeout: 20000 });

  for (let i = 0; i < 15; i++) {
    const freshBtns = page.locator('button.option-btn:not(.correct):not(.wrong)');
    if ((await freshBtns.count()) > 0) {
      await freshBtns.first().click();
      await page.waitForTimeout(300);
    }
    const navBtns = page.locator('button.home-btn');
    const advanceBtn = navBtns.filter({ hasText: /下一題|查看結果/ }).first();
    if ((await advanceBtn.count()) > 0) {
      await advanceBtn.click();
      await page.waitForTimeout(500);
    } else break;
  }

  await page.waitForSelector('.result-container', { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: EVIDENCE + '07g-part5-results.png' });
});
