export type ImageItem = {
  id: string
  file: File
  url: string
  img: HTMLImageElement
  duration: number
}

export const RESOLUTIONS = [
  { label: '1280 x 720 (HD, landscape)', width: 1280, height: 720 },
  { label: '1920 x 1080 (Full HD, landscape)', width: 1920, height: 1080 },
  { label: '1080 x 1920 (Full HD, portrait)', width: 1080, height: 1920 },
  { label: '1080 x 1080 (square)', width: 1080, height: 1080 },
] as const

export function loadImage(file: File): Promise<ImageItem> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ id: crypto.randomUUID(), file, url, img, duration: 3 })
    img.onerror = () => reject(new Error(`Could not load image: ${file.name}`))
    img.src = url
  })
}

/** Draws an image scaled and cropped to cover the full canvas, centered. */
export function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number, alpha = 1) {
  const scale = Math.max(width / img.width, height / img.height)
  const drawWidth = img.width * scale
  const drawHeight = img.height * scale
  const x = (width - drawWidth) / 2
  const y = (height - drawHeight) / 2

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.drawImage(img, x, y, drawWidth, drawHeight)
  ctx.restore()
}

const CANDIDATE_MIME_TYPES = [
  'video/mp4;codecs=h264',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

export function pickSupportedMimeType(): string {
  for (const type of CANDIDATE_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export type RenderOptions = {
  images: ImageItem[]
  width: number
  height: number
  fps: number
  transitionSeconds: number
  mimeType: string
  onProgress?: (fraction: number) => void
}

export function renderVideo(options: RenderOptions): Promise<Blob> {
  const { images, width, height, fps, transitionSeconds, mimeType, onProgress } = options
  if (images.length === 0) return Promise.reject(new Error('No images to render'))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas 2D context unavailable'))

  // Cumulative start time of each image along the timeline (transitions overlap the tail of the previous clip).
  const startTimes: number[] = []
  let t = 0
  for (const item of images) {
    startTimes.push(t)
    t += item.duration
  }
  const totalDuration = t

  const stream = canvas.captureStream(fps)
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  const chunks: BlobPart[] = []
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  return new Promise((resolve, reject) => {
    recorder.onerror = (e) => reject(e)
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType || 'video/webm' }))
    }

    const startedAt = performance.now()
    let rafId = 0

    const frame = () => {
      const elapsed = (performance.now() - startedAt) / 1000

      if (elapsed >= totalDuration) {
        // Draw the final frame once more so the recorder definitely captured it, then stop.
        const last = images[images.length - 1]
        drawCover(ctx, last.img, width, height)
        onProgress?.(1)
        recorder.stop()
        return
      }

      // Find current image index for this point in time.
      let index = images.length - 1
      for (let i = 0; i < images.length; i++) {
        if (elapsed < startTimes[i] + images[i].duration) {
          index = i
          break
        }
      }

      const current = images[index]
      const timeIntoClip = elapsed - startTimes[index]
      const next = images[index + 1]
      const fadeWindow = Math.min(transitionSeconds, current.duration / 2, next ? next.duration / 2 : Infinity)

      ctx.clearRect(0, 0, width, height)

      if (next && fadeWindow > 0 && timeIntoClip >= current.duration - fadeWindow) {
        const fadeProgress = (timeIntoClip - (current.duration - fadeWindow)) / fadeWindow
        drawCover(ctx, current.img, width, height, 1)
        drawCover(ctx, next.img, width, height, fadeProgress)
      } else {
        drawCover(ctx, current.img, width, height, 1)
      }

      onProgress?.(Math.min(elapsed / totalDuration, 1))
      rafId = requestAnimationFrame(frame)
    }

    recorder.start()
    rafId = requestAnimationFrame(frame)

    recorder.addEventListener('stop', () => cancelAnimationFrame(rafId), { once: true })
  })
}
