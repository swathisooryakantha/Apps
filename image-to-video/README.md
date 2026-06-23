# Image to Video

A small browser-only tool that turns a sequence of images into a downloadable video. Everything happens client-side — images are drawn to a canvas and recorded with `MediaRecorder`; nothing is uploaded to a server.

## Features

- Drag-and-drop or pick multiple images
- Reorder, remove, and set a per-image duration
- Optional crossfade transition between images
- Choose output resolution and frame rate
- Preview and download the rendered video (MP4 or WebM, depending on browser support)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
