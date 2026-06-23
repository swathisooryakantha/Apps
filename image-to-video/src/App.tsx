import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type ImageItem,
  RESOLUTIONS,
  loadImage,
  pickSupportedMimeType,
  renderVideo,
} from './lib/video'

function formatSeconds(s: number) {
  return `${s.toFixed(1)}s`
}

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [resolutionIndex, setResolutionIndex] = useState(0)
  const [fps, setFps] = useState(30)
  const [transitionSeconds, setTransitionSeconds] = useState(0.5)
  const [isRendering, setIsRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mimeType = useMemo(() => pickSupportedMimeType(), [])
  const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm'

  const totalDuration = images.reduce((sum, img) => sum + img.duration, 0)

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url))
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    try {
      const loaded = await Promise.all(Array.from(files).filter((f) => f.type.startsWith('image/')).map(loadImage))
      setImages((prev) => [...prev, ...loaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images')
    }
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((img) => img.id !== id)
    })
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function updateDuration(id: string, duration: number) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, duration } : img)))
  }

  async function handleRender() {
    if (images.length === 0) return
    setError(null)
    setIsRendering(true)
    setProgress(0)
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoUrl(null)
    setVideoBlob(null)

    const { width, height } = RESOLUTIONS[resolutionIndex]
    try {
      const blob = await renderVideo({
        images,
        width,
        height,
        fps,
        transitionSeconds,
        mimeType,
        onProgress: setProgress,
      })
      setVideoBlob(blob)
      setVideoUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render video')
    } finally {
      setIsRendering(false)
    }
  }

  function handleDownload() {
    if (!videoBlob || !videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `image-to-video.${fileExtension}`
    a.click()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Image to Video</h1>
        <p className="mt-1 text-sm text-slate-600">
          Turn a sequence of photos into a downloadable video — entirely in your browser, nothing is uploaded.
        </p>
      </header>

      <section
        className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <p className="text-sm text-slate-600">Drag and drop images here, or</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </section>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {images.length > 0 && (
        <section className="mt-6 space-y-3">
          {images.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <img src={item.url} alt="" className="h-16 w-16 rounded object-cover" />
              <div className="flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{item.file.name}</p>
                <label className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  Duration
                  <input
                    type="range"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={item.duration}
                    onChange={(e) => updateDuration(item.id, Number(e.target.value))}
                    className="flex-1"
                  />
                  {formatSeconds(item.duration)}
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded border border-slate-200 px-2 py-0.5 text-xs disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="rounded border border-slate-200 px-2 py-0.5 text-xs disabled:opacity-30">
                  ↓
                </button>
              </div>
              <button type="button" onClick={() => removeImage(item.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                Remove
              </button>
            </div>
          ))}
        </section>
      )}

      <section className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <label className="text-sm text-slate-700">
          Resolution
          <select
            value={resolutionIndex}
            onChange={(e) => setResolutionIndex(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {RESOLUTIONS.map((r, i) => (
              <option key={r.label} value={i}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          Frame rate
          <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {[24, 30, 60].map((value) => (
              <option key={value} value={value}>
                {value} fps
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-full text-sm text-slate-700">
          Crossfade transition between images: {formatSeconds(transitionSeconds)}
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={transitionSeconds}
            onChange={(e) => setTransitionSeconds(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>

        <p className="col-span-full text-xs text-slate-500">
          Total length: {formatSeconds(totalDuration)} · Output format: {fileExtension.toUpperCase()}
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRender}
          disabled={images.length === 0 || isRendering}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {isRendering ? `Rendering... ${Math.round(progress * 100)}%` : 'Render video'}
        </button>

        {videoUrl && (
          <button type="button" onClick={handleDownload} className="rounded-lg border border-indigo-600 px-5 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
            Download video
          </button>
        )}
      </div>

      {isRendering && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-indigo-600 transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {videoUrl && (
        <video src={videoUrl} controls className="mt-6 w-full rounded-xl border border-slate-200" />
      )}
    </div>
  )
}
