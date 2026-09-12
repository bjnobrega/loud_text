# LoudText

LoudText is a lightweight text-to-speech reading companion built to make long, dense texts easier to consume without continuous visual strain.

It started as a personal tool for reading academic material and was developed through AI-assisted pair programming. The application uses the browser-native Web Speech API rather than a proprietary speech model or paid TTS service.

## What it does

- Paste or type text and play it aloud
- Select among speech voices available in the browser / operating system
- Filter voices by language
- Adjust playback speed, pitch and volume
- Change voice and playback settings while reading
- Highlight the current spoken position in the text
- Keep a small local reading history
- Work entirely in the browser with no account required

## Why I built it

Reading large academic documents for long periods can become physically and cognitively tiring. LoudText was built as a practical personal tool: instead of adding another complex reader, I wanted a simple interface where I could paste text, choose a comfortable voice and keep listening while doing something else.

The project is also part of my broader exploration of AI-assisted software development: using coding agents to turn concrete problems from education, research and everyday life into working tools.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Web Speech API (`SpeechSynthesis`)
- Lucide React
- Motion

## How speech works

LoudText uses the Web Speech API built into modern browsers. The voices available therefore depend on the browser, operating system and installed speech engines.

The core reading workflow does not require a cloud TTS API and does not upload the pasted text to a speech service controlled by this project.

## Run locally

```bash
npm install
npm run dev
```

Then open the local address shown by Vite.

## AI-assisted development

This project was built through AI-assisted pair programming. AI tools were used during prototyping, implementation and refinement, while product decisions, testing and final acceptance were performed by the project author.

## Source availability and copyright

This repository is publicly viewable as part of my portfolio and for technical review.

**No open-source license is granted by this repository.** Unless otherwise stated for a specific third-party dependency, the original project source code remains protected by applicable copyright law.

Copyright © 2026 Bruno Nóbrega. All rights reserved.

Third-party libraries used by the project remain subject to their respective licenses.
