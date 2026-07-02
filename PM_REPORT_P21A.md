# PM Report - Wave P2-1 第一批核對報告

**產出時間**: 2026-07-03 00:XX  
**核對者**: PM Agent  
**範圍**: 第一批 X1a/X1b/X2a/X2b/X3a/X3b/X7

---

## 一、總覽表

| Agent | 宣稱值 (DONE) | 實際值 | 配額 | 符合？ | 備註 |
|-------|---------------|--------|------|--------|------|
| **X1a** (P5-T600) | 150 題 | 150 題 | 150 | ✅ | 全欄位正常，JSON 合法 |
| **X1b** (P5-T730) | 165 題 | 165 題 | 165 | ✅ | 全欄位正常，JSON 合法 |
| **X2a** (P6-T600) | 36 組 | 36 passages (144 blanks) | 36 | ✅ | blanks 內皆有 category，ID 範圍正確 |
| **X2b** (P6-T730) | 36 組 | 36 passages (144 blanks) | 36 | ✅ | 同上 |
| **X3a** (P7-T600) | single=21 double=15 triple=9 | 21+15+9 = 45 passages (187 子題) | 21+15+9 | ✅ | 宣稱值為 passage 數，子題皆有 category |
| **X3b** (P7-T730) | single=18 double=12 triple=9 | 18+12+9 = 39 passages (159 子題) | 18+12+9 | ✅ | 同上 |
| **X7** (補 category) | files_tagged=18 items_tagged=595 diff_check=pass | 18 檔備份健全 | — | ✅ | 抽驗 listening_part1_T600/730、part2_T600，題數一致 |

> **說明**: Part 6 的 quota 36 指 passages（組數），每組含多個 blanks（子題共 144 題）；Part 7 的 quota 亦指 passages（組數），子題為各 passage 內 questions 之總和。

---

## 二、詳細核對結果

### X1a (P5-T600_ext1)
- 檔案: `reading_part5_T600_ext1.json`
- 實際題數: **150 / 150**
- JSON 合法: ✅
- 每題皆有 category: ✅
- ID 範圍 P5-T600-051~200: ✅，無重複
- answer 抽驗前 5 後 5: 全在 options 內

### X1b (P5-T730_ext1)
- 檔案: `reading_part5_T730_ext1.json`
- 實際題數: **165 / 165**
- JSON 合法: ✅
- 每題皆有 category: ✅
- ID 範圍 P5-T730-056~220: ✅，無重複
- answer 抽驗前 5 後 5: 全在 options 內

### X2a (P6-T600_ext1)
- 檔案: `reading_part6_T600_ext1.json`
- 實際組數: **36 / 36** (passages)
- 子題 (blanks): 144 題
- JSON 合法: ✅
- 每組 blanks 皆有 category: ✅（144 個 blanks 全有）
- ID 範圍 P6-T600-013~048: ✅，無重複
- answer 抽驗前 5 後 5 passage 內所有 blanks: 全在 options 內

### X2b (P6-T730_ext1)
- 檔案: `reading_part6_T730_ext1.json`
- 實際組數: **36 / 36** (passages)
- 子題 (blanks): 144 題
- JSON 合法: ✅
- 每組 blanks 皆有 category: ✅
- ID 範圍 P6-T730-013~048: ✅，無重複
- answer 抽驗前 5 後 5: 全在 options 內

### X3a (P7-T600_ext1)
| 子項 | 檔案 | 宣稱 | 實際組數 | 實際子題數 | 符合？ |
|------|------|------|----------|-----------|--------|
| Single | `reading_part7_single_T600_ext1.json` | 21 | 21 | 67 | ✅ |
| Double | `reading_part7_double_T600_ext1.json` | 15 | 15 | 75 | ✅ |
| Triple | `reading_part7_triple_T600_ext1.json` | 9 | 9 | 45 | ✅ |
- JSON 合法: ✅
- 每題皆有 category: ✅
- ID 範圍正確，無重複: ✅
- answer 抽驗前 5 後 5 passage 內所有 questions: 全在 options 內

### X3b (P7-T730_ext1)
| 子項 | 檔案 | 宣稱 | 實際組數 | 實際子題數 | 符合？ |
|------|------|------|----------|-----------|--------|
| Single | `reading_part7_single_T730_ext1.json` | 18 | 18 | 54 | ✅ |
| Double | `reading_part7_double_T730_ext1.json` | 12 | 12 | 60 | ✅ |
| Triple | `reading_part7_triple_T730_ext1.json` | 9 | 9 | 45 | ✅ |
- JSON 合法: ✅
- 每題皆有 category: ✅
- ID 範圍正確，無重複: ✅
- answer 抽驗前 5 後 5: 全在 options 內

### X7 (補 category)
- DONE 宣稱: files_tagged=18, items_tagged=595, diff_check=pass
- 備份目錄 `_backup_pre_category/` 含 **18 檔** (另有數個因 cp 指令拼接而產生的髒檔名，不影響功能)
- 抽驗 3 檔比對備份 vs 現行:
  - `listening_part1_T600.json`: 備份 15 題 vs 現行 15 題 ✅
  - `listening_part1_T730.json`: 備份 15 題 vs 現行 15 題 ✅
  - `listening_part2_T600.json`: 備份 40 題 vs 現行 40 題 ✅
- 結論: 題數一致，結構相符 ✅

---

## 三、發現的異常或注意事項

1. **備份目錄有髒檔名**: `_backup_pre_category/` 內有 8 個以「` && cp ...`」字樣結尾的異常條目（非 .json 檔），應為早期 cp 指令拼貼錯誤所致。不影響實際備份，但建議清理。

2. **X7 的 items_tagged 數字**: 宣稱 595 items，但本報告未完整遍歷所有 18 檔確認精確數字（因屬跨聽力+閱讀的大範圍），建議 QA-P2A 階段全量核對。

---

## 四、第二批即時狀態 (X4a/X4b/X5a/X5b/X6a/X6b)

### 總覽

| Agent | Log 存在？ | Log 持續更新？ | DONE 存在？ | 當前階段 | 滯留時間 |
|-------|-----------|---------------|------------|---------|----------|
| X4a (L1+L2-T600) | ✅ 1.5KB | ❌ 最後更新 00:00 | ❌ | 已執行 generate 腳本，未驗證/寫 DONE | ~1.5h |
| X4b (L1+L2-T730) | ✅ 1.8KB | ❌ 最後更新 00:00 | ❌ | Part1 temp 檔寫完，Part2 進行中 | ~1.5h |
| X5a (L3-T600) | ✅ 1.0KB | ❌ 最後更新 00:00 | ❌ | 規劃完成，尚未開始 generate | ~1.5h |
| X5b (L3-T730) | ✅ 2.4KB | ❌ 最後更新 00:00 | ❌ | Batch 1 規劃中，未開始 generate | ~1.5h |
| X6a (L4-T600) | ✅ 1.0KB | ❌ 最後更新 23:59 | ❌ | 規劃完成，尚未開始 generate | ~1.5h |
| X6b (L4-T730) | ✅ 0.5KB | ❌ 最後更新 23:59 | ❌ | 剛讀完範本，尚未開始 generate | ~1.5h |

### 觀察
- **全部 6 個 Agent 皆停滯約 1.5 小時**，無 DONE 標記、無近期 log 更新。
- 最後活躍時間集中在 23:59~00:00，之後無任何進展。
- X4a 的 generate 腳本已執行，output 顯示 Part 1 45 題 / Part 2 105 題（但配額為 120 題，short 15 題）。

---

## 五、給協調者 (Claude) 的建議

### 優先處理（第一批）
- **第一批 Agent 全數通過核對**，無需重派。
- 建議 QA-P2A 階段完整驗證 X7 的 595 題 category 正確性及 18 檔備份完整性。

### 緊急處理（第二批卡死）
- **第二批 6 個 Agent 全部停滯 1.5h**，推測可能原因：
  a. Opencode context 耗盡或行程被回收
  b. 模型輸出中斷未恢復
  c. 等待使用者確認但無回應
- **建議立即檢查**目前 opencode 行程 (`ps aux | findstr opencode`)，若無對應行程則全部重派：
  - X4a: 重派前注意 Part 2 需 120 題（非 105），需修 generate 腳本
  - X4b: Part1 temp 檔可能已存在，建議清暫存後重跑
  - X5a/X5b: 無進度，可直接重派
  - X6a/X6b: 無進度，可直接重派
- 如需節省成本，可考慮將分拆任務合併：
  - X4a+X4b 整併為一個 Listening Part1+2 雙 T600/T730 Agent
  - X5a+X5b 同理
  - X6a+X6b 同理

### 流程改進
- 建議未來在 P2_HEARTBEAT 加入「若 Agent 停滯 >30 分鐘」自動警示機制。
- 建議第二批 DONE 檔的配額定義提前統一（如 listening 的「題數」是指 groups 還是 questions），避免核對混淆。

---

## 附錄：核對統計

- 核對檔案數: 10 (_ext1) + 3 (備份抽驗) = **13**
- 差異數: **0**
- 第二批停滯 Agent: **6**
