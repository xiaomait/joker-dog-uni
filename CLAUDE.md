# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a small `uni-app` + Vue 3 application for displaying “舔狗语录”. The current app has a single page, plays looping background audio, fetches quotes from remote APIs with offline fallback content, and can export the current quote as an image.

## Development Commands

The repository does not include a root `package.json`, test runner, or lint configuration. Development is driven through the `uni-app` toolchain / HBuilderX project workflow.

- Open the project in HBuilderX to run and build targets such as H5 and mini-programs.
- Main generated output is written under `unpackage/`; do not treat generated files there as source of truth.
- There is currently no repo-local command for:
  - install dependencies
  - run tests
  - run a single test
  - lint or format

## Source Structure

- `main.js` boots the app with Vue 3 `createSSRApp`.
- `App.vue` defines app lifecycle hooks and global page-level styles.
- `pages.json` is the route and global UI configuration entrypoint for `uni-app`; the app currently exposes a single page at `pages/index/index`.
- `manifest.json` contains platform-specific app configuration, including H5 router mode and mini-program / app packaging settings.
- `pages/index/index.vue` contains the entire user-facing screen: safe-area handling, audio controls, quote loading, status messaging, and export action wiring.
- `utils/index.js` contains the non-visual logic shared by the page: quote normalization, remote fetch wrapper, offline quote picking, and canvas-based image export.
- `static/` stores runtime assets used by the page, including the hero image, audio file, and music toggle icons.
- `unpackage/` contains generated build artifacts and cache files; avoid editing it manually.

## Architecture Notes

### Runtime flow

On page load, `pages/index/index.vue` initializes an `InnerAudioContext`, then immediately attempts to fetch a quote. Quote loading tries the remote endpoints in order and falls back to a local quote list if every request fails. On page ready, it attempts autoplay for the looped background track. On page unload, the audio context is destroyed.

### Quote data handling

Remote quote APIs are not assumed to share a fixed response schema. `utils/index.js` normalizes responses by recursively searching common text-bearing keys such as `data`, `text`, `content`, `msg`, and `hitokoto`, and also handles nested objects and arrays. This means new quote APIs should usually be added by extending the `endpoints` array in `pages/index/index.vue`, without changing page rendering logic.

### Export-to-image pipeline

The “保存成图片” feature is split between page state and utility logic:

- `pages/index/index.vue` owns the reactive state (`quoteText`, `heroImage`, `canvasWidth`, `canvasHeight`) and calls the export helper.
- `utils/index.js` renders the export card into an off-screen `canvas`, draws the hero image and wrapped quote text, then branches by platform:
  - `H5`: downloads the generated PNG through a temporary anchor element.
  - non-`H5`: saves the image to the photo album with `uni.saveImageToPhotosAlbum`.

When changing export layout, keep the page-side hidden canvas and the utility-side drawing dimensions in sync.

### Cross-platform considerations

The page uses `uni-app` conditional compilation blocks (`#ifdef H5`, `#ifdef MP-WEIXIN`, `#ifndef H5`) in both style and export logic. Safe-area spacing is derived from `uni.getSystemInfoSync()` and, for WeChat Mini Program, `uni.getMenuButtonBoundingClientRect()`. When changing layout or platform behavior, verify whether the change belongs in a platform-specific branch.

## Important Repository Facts

- This repo currently has no AGENTS.md, Cursor rules, or Copilot instructions files.
- `README.md` is minimal and only states that this is a uni-app implementation of a “舔狗日记” app.
- Generated artifacts already exist under `unpackage/dist/`; prefer editing source files instead of generated outputs.
