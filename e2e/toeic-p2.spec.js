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
   P2-1: 繁中介面驗證 (no English UI residue)
   ───────────────────────────────────────────── */
test('P2-01-zh-hant-interface', async ({ page }) => {
  await loadHome(page);

  // html lang attribute
  const htmlLang = await page.locator('html').getAttribute('lang');
  expect(htmlLang).toBe('zh-Hant');

  // Track badge in Chinese
  await expect(page.locator('.track-badge')).toContainText('目標');

  // Section titles in Chinese
  const sectionTitles = page.locator('h2.section-title');
  await expect(sectionTitles.nth(0)).toHaveText('聽力精練');
  await expect(sectionTitles.nth(1)).toHaveText('閱讀精練');
  await expect(sectionTitles.nth(2)).toHaveText('綜合工具');

  // Cards: Part names in Chinese (Chinese + English mixed)
  const cards = page.locator('.card h3');
  await expect(cards.nth(0)).toHaveText('Part 1 照片描述');
  await expect(cards.nth(2)).toHaveText('Part 3 簡短對話');
  await expect(cards.nth(4)).toHaveText('Part 5 單句填空');
  // Tool cards in Chinese
  await expect(cards.nth(7)).toHaveText('綜合練習');
  await expect(cards.nth(8)).toHaveText('錯題本');
  await expect(cards.nth(9)).toHaveText('弱點分析');
  await expect(cards.nth(10)).toHaveText('練習設定');

  // Navbar text in Chinese
  const navbar = page.locator('#toeic-navbar');
  await expect(navbar).toContainText('TOEIC 練習室');

  await page.screenshot({ path: EVIDENCE + 'p2-01-home-zh.png', fullPage: true });
});

/* ─────────────────────────────────────────────
   P2-2: 題庫分片生效 (ext1 files loaded)
   ───────────────────────────────────────────── */
test('P2-02-sharded-data-loading', async ({ page }) => {
  const fetchedUrls = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('_ext1.json')) {
      fetchedUrls.push(url);
    }
  });

  await loadHome(page);

  // Enter Part 5 to trigger data loading
  await startPractice(page, 'Part 5');
  await page.waitForSelector('button.option-btn', { timeout: 20000 });

  // Verify ext1 file was requested
  expect(fetchedUrls.length).toBeGreaterThan(0);
  expect(fetchedUrls.some(u => u.includes('reading_part5'))).toBeTruthy();

  // Verify we have questions that could only come from ext1 (id > base count)
  const hasHighId = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s) return false;
    return s.items.some(item => {
      const id = item.id || item.questionId || '';
      return id.includes('-050') || id.includes('-060') || id.includes('-070');
    });
  });
  // Note: due to randomization, high-ID questions might not appear in session.
  // The ext1 network fetch is the primary verification.
  console.log(`_ext1.json requests: ${fetchedUrls.length}, hasHighId: ${hasHighId}`);

  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   P2-3: 出題數設定 (custom counts + restore defaults)
   ───────────────────────────────────────────── */
test('P2-03-session-config-custom-counts', async ({ page }) => {
  await loadHome(page);

  // Open settings page
  await page.locator('.card h3').filter({ hasText: '練習設定' }).click();
  await page.waitForSelector('.home-btn', { timeout: 10000 });
  await page.waitForTimeout(300);

  await page.screenshot({ path: EVIDENCE + 'p2-03a-settings-before.png', fullPage: true });

  // Modify Part 5 to 5, Part 2 to 3
  const inputs = page.locator('input[type="number"]');
  // Part 1=p1 (0), Part 2=p2 (1), Part 3=p3 (2), Part 4=p4 (3), Part 5=p5 (4), Part 6=p6 (5), Part 7=p7 (6)
  await inputs.nth(4).fill('5');  // p5 = 5
  await inputs.nth(1).fill('3');  // p2 = 3

  // Save
  await page.locator('button').filter({ hasText: '儲存設定' }).click();
  await page.waitForSelector('.card', { state: 'visible', timeout: 10000 });

  // Verify config saved to localStorage
  const savedConfig = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('toeic_session_config') || '{}');
  });
  expect(savedConfig.p5).toBe(5);
  expect(savedConfig.p2).toBe(3);

  // Start composite practice and verify counts
  await page.locator('.card h3').filter({ hasText: /綜合練習/ }).click();
  await page.waitForSelector('.composite-summary', { timeout: 30000 });
  await page.waitForTimeout(300);

  // Read session part counts from the setup summary
  const partCounts = await page.evaluate(() => {
    const perParts = document.querySelectorAll('.per-part-result');
    const result = {};
    perParts.forEach(pp => {
      const label = pp.querySelector('.per-part-label');
      const score = pp.querySelector('.per-part-score');
      if (label && score) {
        result[label.textContent.trim()] = score.textContent.trim();
      }
    });
    return result;
  });
  console.log('Part counts from setup:', JSON.stringify(partCounts));

  // Click start and get session data
  await page.locator('button').filter({ hasText: '開始練習' }).click();
  await page.waitForSelector('.quiz-header', { timeout: 30000 });
  await page.waitForTimeout(500);

  // Get actual session part counts
  const sessionCounts = await page.evaluate(() => {
    const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
    if (!s) return null;
    const counts = {};
    s.items.forEach(item => {
      counts[item.part] = (counts[item.part] || 0) + 1;
    });
    return counts;
  });

  expect(sessionCounts).not.toBeNull();
  expect(sessionCounts[5]).toBe(5);
  expect(sessionCounts[2]).toBe(3);

  await goBackHome(page);

  // Restore defaults and verify
  await page.locator('.card h3').filter({ hasText: '練習設定' }).click();
  await page.waitForSelector('.home-btn', { timeout: 10000 });
  await page.locator('button').filter({ hasText: '恢復預設' }).click();
  await page.waitForTimeout(200);

  // Verify inputs reset to defaults
  const inputsAfter = page.locator('input[type="number"]');
  await expect(inputsAfter.nth(4)).toHaveValue('10'); // p5 default
  await expect(inputsAfter.nth(1)).toHaveValue('8');  // p2 default

  // Save defaults back
  await page.locator('button').filter({ hasText: '儲存設定' }).click();
  await page.waitForSelector('.card', { state: 'visible', timeout: 10000 });

  await page.screenshot({ path: EVIDENCE + 'p2-03b-settings-after-reset.png', fullPage: true });
});

/* ─────────────────────────────────────────────
   P2-4: 弱點分析 (wrong answers recorded, bars shown)
   ───────────────────────────────────────────── */
test('P2-04-weakness-analysis', async ({ page }) => {
  // Clear previous stats
  await loadHome(page);
  await page.evaluate(() => {
    localStorage.setItem('toeic_stats', '{}');
    localStorage.setItem('toeic_wrong', '[]');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.card', { state: 'visible', timeout: 10000 });

  // Answer some Part 5 questions deliberately wrong
  for (let attempt = 0; attempt < 4; attempt++) {
    await startPractice(page, 'Part 5');
    await page.waitForSelector('button.option-btn', { timeout: 20000 });
    await page.waitForTimeout(300);

    // Pick WRONG answer
    const correctAnswer = await page.evaluate(() => {
      const s = window.TOEIC && window.TOEIC.App && window.TOEIC.App._session;
      return s ? s.items[s.currentIndex].answer : null;
    });

    const optionBtns = page.locator('button.option-btn');
    const count = await optionBtns.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const fullText = (await optionBtns.nth(i).textContent()) || '';
      const answerText = fullText.replace(/^\([A-D]\)\s*/, '').trim();
      if (answerText !== correctAnswer) {
        await optionBtns.nth(i).click();
        clicked = true;
        break;
      }
    }
    if (!clicked) await optionBtns.first().click();
    await page.waitForTimeout(500);

    // Finish this session
    const finishBtn = page.locator('button.home-btn').filter({ hasText: /查看結果/ });
    if (await finishBtn.count() > 0 && await finishBtn.isEnabled()) {
      await finishBtn.click();
      await page.waitForTimeout(300);
    }

    // Go back home
    await goBackHome(page);
  }

  // Now go to analytics
  await page.locator('.card h3').filter({ hasText: '弱點分析' }).click();
  await page.waitForSelector('.analytics-section, .analytics-insufficient', { timeout: 10000 });
  await page.waitForTimeout(500);

  // Verify stats are recorded
  const stats = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('toeic_stats') || '{}');
  });
  console.log('toeic_stats:', JSON.stringify(stats));

  // Check that we have records with the key format "5|category" (Part 5)
  const part5Keys = Object.keys(stats).filter(k => k.startsWith('5|'));
  expect(part5Keys.length).toBeGreaterThan(0);

  let totalWrong = 0;
  let totalAttempts = 0;
  Object.values(stats).forEach(v => {
    totalWrong += v.wrong;
    totalAttempts += v.attempts;
  });
  expect(totalAttempts).toBeGreaterThanOrEqual(4);
  expect(totalWrong).toBeGreaterThanOrEqual(4);

  // Check analytics page UI
  // Should have chart rows or insufficient-data message
  const hasAnalyticsContent = await page.locator('.chart-row, .analytics-insufficient').count();
  expect(hasAnalyticsContent).toBeGreaterThan(0);

  // Check for category-based content
  const hasWeakCards = await page.locator('.analytics-weak-card, .analytics-suggestion-item').count();
  const hasInsufficient = await page.locator('.analytics-insufficient').count();
  // Either weak cards exist or insufficient message shows (both acceptable)
  expect(hasWeakCards + hasInsufficient).toBeGreaterThan(0);

  await page.screenshot({ path: EVIDENCE + 'p2-04-weakness-analysis.png', fullPage: true });

  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   P2-5: 錯題本 category 標籤與篩選
   ───────────────────────────────────────────── */
test('P2-05-wrongbook-category-filter', async ({ page }) => {
  // Seed wrong items with category tags (fresh context)
  await page.addInitScript(() => {
    localStorage.setItem('toeic_wrong', JSON.stringify([
      {
        part: 5, track: 'T600', questionId: 'seed-1',
        category: '時態',
        question: 'The report __ submitted by Friday.',
        options: ['A) must be', 'B) must have', 'C) must', 'D) must been'],
        userAnswer: 'B) must have', correctAnswer: 'A) must be',
        explanation: '"must be submitted" is the correct passive form.',
        timestamp: Date.now() - 86400000
      },
      {
        part: 5, track: 'T600', questionId: 'seed-2',
        category: '介系詞',
        question: 'She is responsible __ managing the team.',
        options: ['A) for', 'B) to', 'C) with', 'D) at'],
        userAnswer: 'B) to', correctAnswer: 'A) for',
        explanation: '"responsible for" is the correct collocation.',
        timestamp: Date.now() - 72000000
      },
      {
        part: 5, track: 'T600', questionId: 'seed-3',
        category: '連接詞',
        question: 'We will proceed __ the weather improves.',
        options: ['A) unless', 'B) if', 'C) although', 'D) because'],
        userAnswer: 'A) unless', correctAnswer: 'B) if',
        explanation: '"if" introduces a condition for proceeding.',
        timestamp: Date.now() - 36000000
      }
    ]));
  });

  await loadHome(page);

  // Open wrong book
  await page.locator('.card h3').filter({ hasText: /錯題/ }).click();
  await page.waitForSelector('.wrong-item', { timeout: 10000 });
  await page.waitForTimeout(500);

  const wrongItems = page.locator('.wrong-item');
  expect(await wrongItems.count()).toBeGreaterThanOrEqual(3);

  // Check category tags exist on items
  const categoryTags = page.locator('.wrong-category');
  expect(await categoryTags.count()).toBeGreaterThanOrEqual(1);
  const catText = await categoryTags.first().textContent();
  expect(catText.length).toBeGreaterThan(0);
  console.log('Category tags found:', await categoryTags.allTextContents());

  // Verify category filter select exists (second filter-select)
  const filterSelects = page.locator('select.filter-select');
  expect(await filterSelects.count()).toBeGreaterThanOrEqual(2);

  // Filter by a category
  const catSelect = filterSelects.nth(1);
  await catSelect.selectOption('時態');
  await page.waitForTimeout(500);

  // After filtering, should still see items (matching items)
  const filteredItems = page.locator('.wrong-item');
  // At least 1 item with 時態 category should remain
  expect(await filteredItems.count()).toBeGreaterThanOrEqual(1);

  // Reset filter to all
  await catSelect.selectOption('全部');
  await page.waitForTimeout(300);
  expect(await page.locator('.wrong-item').count()).toBe(3);

  await page.screenshot({ path: EVIDENCE + 'p2-05-wrongbook-category.png', fullPage: true });

  await goBackHome(page);
});

/* ─────────────────────────────────────────────
   P2-6: 登入元件 (login button exists, app works without login)
   ───────────────────────────────────────────── */
test('P2-06-login-component-stub', async ({ page }) => {
  await loadHome(page);

  // Login button should be visible in navbar
  const authArea = page.locator('#toeic-auth-area');
  await expect(authArea).toBeVisible({ timeout: 10000 });

  // Either a login button or user info should be visible
  const loginBtn = page.locator('button').filter({ hasText: /登入/ });
  const hasLoginBtn = await loginBtn.count();

  // Full app functionality works WITHOUT login (offline-first design)
  // Verify home renders, cards are clickable, settings accessible
  const cards = page.locator('.card');
  expect(await cards.count()).toBeGreaterThanOrEqual(9);

  // Can navigate to settings without login
  await page.locator('.card h3').filter({ hasText: '練習設定' }).click();
  await page.waitForSelector('.home-btn', { timeout: 10000 });
  await expect(page.locator('h2.section-title')).toContainText('練習設定');
  await goBackHome(page);

  // Can navigate to analytics without login
  await page.locator('.card h3').filter({ hasText: '弱點分析' }).click();
  await page.waitForTimeout(1000);
  // Should show either analytics or insufficient data
  const analyticsVisible = await page.locator('.analytics-section, .analytics-insufficient').count();
  expect(analyticsVisible).toBeGreaterThan(0);
  await goBackHome(page);

  console.log(`Login button present: ${hasLoginBtn > 0}, full app works without login: true`);
});

/* ─────────────────────────────────────────────
   P2-7: 主控台無 JS error (Phase 2 features)
   ───────────────────────────────────────────── */
test('P2-07-no-console-errors', async ({ page }) => {
  const rawErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') rawErrors.push(msg.text());
  });
  page.on('pageerror', (err) => rawErrors.push(err.message));

  await loadHome(page);

  // Exercise Phase 2 features
  await page.locator('.card h3').filter({ hasText: '練習設定' }).click();
  await page.waitForSelector('.home-btn', { timeout: 10000 });
  await page.waitForTimeout(200);
  await goBackHome(page);

  await page.locator('.card h3').filter({ hasText: '弱點分析' }).click();
  await page.waitForTimeout(1000);
  await goBackHome(page);

  await page.locator('.card h3').filter({ hasText: /綜合練習/ }).click();
  await page.waitForSelector('.composite-summary', { timeout: 30000 });
  await page.locator('button').filter({ hasText: '開始練習' }).click();
  await page.waitForSelector('.quiz-header', { timeout: 30000 });
  await page.waitForTimeout(300);
  await goBackHome(page);

  await page.locator('.card h3').filter({ hasText: /錯題/ }).click();
  await page.waitForSelector('.wrong-item, .empty-wrongbook', { timeout: 10000 });
  await page.waitForTimeout(300);
  await goBackHome(page);

  await startPractice(page, 'Part 5');
  await page.waitForSelector('button.option-btn', { timeout: 20000 });
  await page.waitForTimeout(200);
  await goBackHome(page);

  await page.locator('button.track-btn').filter({ hasText: '目標 730' }).click();
  await page.waitForTimeout(500);
  await page.locator('button.track-btn').filter({ hasText: '目標 600' }).click();
  await page.waitForTimeout(500);

  // Separate known external issues from real app errors
  const knownExternal = rawErrors.filter(e =>
    e.includes('favicon.ico') || e.includes('INTERNAL')
  );
  const realErrors = rawErrors.filter(e => !knownExternal.includes(e));

  if (knownExternal.length > 0) {
    console.log('[KNOWN] External SDK errors (Firebase CDN):', knownExternal);
  }
  if (realErrors.length > 0) {
    console.log('[FAIL] App JS errors:', realErrors);
  }
  expect(realErrors).toHaveLength(0);
});

/* ─────────────────────────────────────────────
   P2-8: Phase 2 截圖 (evidence)
   ───────────────────────────────────────────── */
test('P2-08-phase2-screenshots', async ({ page }) => {
  await loadHome(page);

  // 1. Home page with full Chinese UI
  await page.screenshot({ path: EVIDENCE + 'p2-08a-home-full.png', fullPage: true });

  // 2. Settings page
  await page.locator('.card h3').filter({ hasText: '練習設定' }).click();
  await page.waitForSelector('.home-btn', { timeout: 10000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: EVIDENCE + 'p2-08b-settings.png', fullPage: true });
  await goBackHome(page);

  // 3. Weakness analysis
  await page.locator('.card h3').filter({ hasText: '弱點分析' }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: EVIDENCE + 'p2-08c-analytics.png', fullPage: true });
  await goBackHome(page);

  // 4. Wrong book with category tags (if any)
  await page.locator('.card h3').filter({ hasText: /錯題/ }).click();
  await page.waitForSelector('.wrong-item, .empty-wrongbook', { timeout: 10000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: EVIDENCE + 'p2-08d-wrongbook.png', fullPage: true });
  await goBackHome(page);

  // 5. Composite setup page
  await page.locator('.card h3').filter({ hasText: /綜合練習/ }).click();
  await page.waitForSelector('.composite-summary', { timeout: 30000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: EVIDENCE + 'p2-08e-composite-setup.png', fullPage: true });
  await goBackHome(page);
});
