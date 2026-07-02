# TOEIC L&R Practice Tool

Professional TOEIC Listening &amp; Reading practice platform for adult learners.

## Features

- **Dual Track System**: T600 (600-point冲刺) and T730 (730-point进阶) with difficulty-differentiated bank
- **All 7 Parts**: Listening Part 1-4 (Photo Description, Question-Response, Short Conversation, Short Talk) + Reading Part 5-7 (Incomplete Sentences, Text Completion, Reading Comprehension)
- **Composite Practice**: Full mock test mode (P1=2Q, P2=8Q, P3=12Q, P4=10Q, P5=10Q, P6=1 passage, P7=2 passages)
- **TTS Pronunciation**: Text-to-speech for all questions and passages (English, adjustable speed by track)
- **Wrong Book**: Auto-records incorrect answers with re-answer capability and per-part filtering
- **Responsive Design**: Works on desktop, tablet, and mobile

## Deploy

```bash
firebase deploy --only hosting
```

## Tech Stack

Vanilla HTML/CSS/JS, static site, no build step required.

## Structure

```
toeic-app/
  index.html          Entry point
  css/style.css       All styles
  js/                 9 JS modules (app, data-loader, quiz-engine, etc.)
  data/               18 JSON banks (T600/T730 for each part)
```
