# TOEIC 工具 Phase 2 Wave P2-1 品管報告（QA_P2A）

**執行日期：** 2026-07-03  
**QA Agent：** 品管專責  
**檢查範圍：** 36 檔（18 基礎檔 + 18 _ext1 擴充檔）

---

## 一、全量統計（基礎 + ext1 合併後總題量）

| Part | 軌道 | 基礎檔 | 擴充檔 | 合計題數 | 合計小題 |
|---|---|---|---|---|---|
| Part 1 | T600 | 15 | 45 | **60** | — |
| Part 1 | T730 | 15 | 45 | **60** | — |
| Part 2 | T600 | 40 | 120 | **160** | — |
| Part 2 | T730 | 40 | 120 | **160** | — |
| Part 3 | T600 | 15 | 45 | **60** | 182 |
| Part 3 | T730 | 15 | 45 | **60** | 186 |
| Part 4 | T600 | 12 | 36 | **48** | 144 |
| Part 4 | T730 | 12 | 36 | **48** | 146 |
| Part 5 | T600 | 50 | 150 | **200** | — |
| Part 5 | T730 | 55 | 165 | **220** | — |
| Part 6 | T600 | 12 | 36 | **48** | (144 blanks) |
| Part 6 | T730 | 12 | 36 | **48** | (144 blanks) |
| Part 7 Single | T600 | 7 | 21 | **28** | 90 |
| Part 7 Single | T730 | 6 | 18 | **24** | 74 |
| Part 7 Double | T600 | 5 | 15 | **20** | 100 |
| Part 7 Double | T730 | 4 | 12 | **16** | 80 |
| Part 7 Triple | T600 | 3 | 9 | **12** | 60 |
| Part 7 Triple | T730 | 3 | 9 | **12** | 60 |

---

## 二、結構驗證結果

### 全量自動化檢查（Node.js 腳本）

| 檢查項目 | 結果 |
|---|---|
| JSON 語法合法（36/36 檔） | ✅ 全通過 |
| answer 逐字在 options 內（含 Part3/4/7 questions、Part6 blanks 層級） | ✅ 全通過（修正後） |
| Part2 恆 3 選項、其餘 4 選項 | ✅ 全通過 |
| category 存在且值在合法清單內 | ✅ 全通過 |
| id 格式正確、基礎+ext1 合併無重複 | ✅ 全通過 |
| 完全重複題（question/audioScript/talk 完全相同） | ✅ 無發現 |
| Part5 高度相似題（去空格後前 40 字元相同） | ✅ 無發現 |

### 最終驗證：0 錯誤、0 重複

---

## 三、發現問題與修正清單

### A. Part3 圖表整合（12 項）

以下 12 題標記 `requiresChart: true`，但答案可直接從對話內容取得，名不副實。

#### T600 ext1（8 項）

| 題號 | 原問題 | 問題 | 修正方式 |
|---|---|---|---|
| L3-T600-020-Q1 | Which room did the speakers decide to book? | B 直接說「Let's take Room 301」 | `requiresChart` → false，更新 explanation |
| L3-T600-024-Q2 | How much will the woman pay in total? | B 說每堂$75 × 2 = $150 可心算 | **改寫題目**為「chart 上最貴與最便宜課程價差？」需對照圖表 |
| L3-T600-032-Q1 | Which region had the highest actual sales? | A/B 對話中明確指出 South 最高 | `requiresChart` → false，更新 explanation |
| L3-T600-036-Q2 | How much cheaper is the layover flight? | B 說直飛$850、轉機$580，差$270 可心算 | `requiresChart` → false，更新 explanation |
| L3-T600-044-Q2 | What is the total cost of the sandwich platters? | A 說兩份 × B 說每份$48 = $96 可心算 | `requiresChart` → false，更新 explanation |
| L3-T600-048-Q1 | Which floor is the HR department on? | B 直接說「HR is on the fourth floor」 | **改寫題目**為「大樓目錄共幾層樓？」需對照圖表 |
| L3-T600-056-Q2 | How much does Express International cost? | B 直接說「兩天$45」 | `requiresChart` → false，更新 explanation |
| L3-T600-060-Q2 | When was development phase scheduled to end? | A 直接說「should finish by July twentieth」 | **改寫題目**為「專案共幾個階段？」需對照圖表 |

#### T730 ext1（4 項）

| 題號 | 原問題 | 問題 | 修正方式 |
|---|---|---|---|
| L3-T730-021-Q1 | Why is Lakeside Resort not suitable? | B 直接說只有兩間討論室 | `requiresChart` → false，更新 explanation |
| L3-T730-021-Q3 | What is the main reason speakers choose Riverside Inn? | A 直接說"balanced" | **改寫題目**為「哪個場地滿意度評分最高？」需對照圖表 |
| L3-T730-038-Q1 | Why hesitate to choose Dr. Alvarez? | B 直接說費用幾乎是其他人兩倍 | `requiresChart` → false，更新 explanation |
| L3-T730-038-Q3 | Which speaker do they recommend? | B 直接說"recommend Nina Okonkwo" | **改寫題目**為「哪位講者演講費最低？」需對照圖表 |

---

### B. 英文品質（4 項）

| 檔名 | 題號 | 嚴重度 | 問題 | 修正 |
|---|---|---|---|---|
| reading_part5_T730_ext1.json | P5-T730-126 | 高 | options 中 "bother" 重複出現兩次，實質只有 3 個選項 | 將重複的 "bother" 改為 "hinder"，更新 explanation |
| reading_part5_T730_ext1.json | P5-T730-076 | 中 | 四選項（liable/accountable/responsible/answerable）全部可與 "held ... for" 搭配，非單一正解 | 改句子為 "found ____ for"，使 "found liable for" 成為唯一法律慣用語 |
| listening_part1_T600_ext1.json | L1-T600-056 | 低 | "cuisine stalls" 語法不自然（cuisine 為不可數名詞） | 改為 "food stalls"（imageDescription + options[0] + answer） |
| listening_part1_T600_ext1.json | L1-T600-046 | 低 | "a row of" 在同句重複兩次，讀感不佳 | 改為 "Cars are parked along the street in front of several shops." |

---

### C. 難度落差修正（25 項）

#### T600 過難 → 降級（5 項）

| 題號 | 原問題 | 修正 |
|---|---|---|
| P5-T600-133 | "He is the person \_\_ I believe can solve..."（插入句陷阱） | 去掉 "I believe"，簡化為單純關係代名詞題 |
| P5-T600-107 | "for" 作 because 的古老用法 | 改為 "because"，選項同步調整 |
| P5-T600-114 | "provided that" 正式法律條件句 | 改為 "if"，選項同步調整 |
| P5-T600-117 | "thanks to" vs "because" 微妙語意區分 | 改為基本 "because" 因果句 |
| P5-T600-166 | "coordinate together" 搭配詞陷阱 | 去掉 "together"，改為 "work on" 基本搭配 |

#### T730 過易 → 升級（20 項）

| 題號 | 原問題 | 修正 |
|---|---|---|
| P5-T730-095 | 基本 who 關係代名詞 | 改為 whose 所有格 + 複雜句 |
| P5-T730-139 | 基本 who 關係代名詞 | 改為 whose 所有格 + 高階詞彙 |
| P5-T730-058 | "comply with" 基本介系詞 | 改為 "abide by"（進階正式用語） |
| P5-T730-111 | "depend on" 基本介系詞 | 改為 "hinge on"（進階片語動詞） |
| P5-T730-181 | "depends on" 重複出現 | 改為 "contingent upon"（正式搭配） |
| P5-T730-190 | "invest in" 基本介系詞 | 改為 "channel into"（進階搭配） |
| P5-T730-140 | 假設語氣與 T600 同等級 | 改為被動式 + demand 驅動 |
| P5-T730-096 | 假設語氣與 T600 同等級 | 改為被動式 + insist 驅動 |
| P5-T730-102 | "compatible with" 基本 | 改為 "conducive to"（進階搭配） |
| L1-T730-029 | 選項干擾太明顯 | 改為同場景混淆動作（tasting vs seasoning vs stirring vs serving） |
| L1-T730-037 | 選項干擾太明顯 | 改為同場景混淆描述（demonstrating vs leading vs adjusting vs stretching） |
| L2-T730-149 | 簡單 WH 問句 | 改為間接疑問句 "Do you happen to know how long..." |
| L2-T730-082 | 簡單 WH 問句 | 改為間接疑問句 "Could you clarify what specific credentials..." |
| L2-T730-102 | 簡單 WH 問句 | 改為更複雜句式 "I'm curious what kind of..." |
| L2-T730-097 | 簡單 WH 問句 | 改為更複雜句式 "I wanted to check how much advance notice..." |
| L2-T730-088 | 簡單 WH 問句 | 改為間接疑問句 "Could you remind me by when..." |
| L2-T730-121 | 簡單 WH 問句 | 改為更複雜句式 "I've forgotten the exact date — when is..." |
| L2-T730-148 | 簡單陳述句 | 加長為雙子句陳述 |
| L2-T730-104 | 簡單 Yes/No | 改為選擇問句 |
| L2-T730-075 | 基礎單字 "hear" | 提升詞彙為 "fleet vehicle reimbursement policy" |

---

## 四、X7 補標驗證

| 檢查項目 | 結果 |
|---|---|
| 基礎 18 檔備份存在 | ✅ 全部存在於 `data\_backup_pre_category\` |
| 題數與備份一致 | ✅ 18/18 檔題數完全一致 |
| 每題/每小題有 category | ✅ 0 遺漏 |
| category 值皆合法 | ✅ 0 非法值 |
| 除 category 外零改動 | ✅ 深度比對 3 檔（Part1/Part6/Part7-triple）確認無任何非 category 差異 |

---

## 五、最終全量驗證結果

```
結構驗證：0 錯誤
重複題檢查：0 完全重複、0 高度相似
category 合法：全通過
id 無重複：全通過
answer-in-options：全通過
選項數量正確：全通過
```

**最終判定：all_pass = true**

---

## 六、修正統計摘要

| 類別 | 發現數 | 已修正數 |
|---|---|---|
| Part3 圖表整合（requiresChart 名不副實） | 12 | 12 |
| 英文品質（文法/用字/選項） | 4 | 4 |
| T600 過難降級 | 5 | 5 |
| T730 過易升級（Part1） | 2 | 2 |
| T730 過易升級（Part2） | 9 | 9 |
| T730 過易升級（Part5） | 9 | 9 |
| **合計** | **41** | **41** |
| 重複題改寫 | 0 | 0 |
