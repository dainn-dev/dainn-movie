"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  SkipForward,
  Subtitles,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import type { ChapterSummaryDto, VideoSourceInfoDto, WatchProgressDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

const CAPTIONS_PREFS_KEY = "dmovie.player.captions.v1"
const PLAYBACK_RATE_KEY = "dmovie.player.playbackRate.v1"

/** DAI-97 — tốc độ phát (HTMLVideoElement.playbackRate). */
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const

type CaptionsPrefs = { fontPercent: number; color: string }

function loadCaptionsPrefs(): CaptionsPrefs {
  if (typeof window === "undefined") return { fontPercent: 100, color: "#ffffff" }
  try {
    const raw = localStorage.getItem(CAPTIONS_PREFS_KEY)
    if (!raw) return { fontPercent: 100, color: "#ffffff" }
    const j = JSON.parse(raw) as Partial<CaptionsPrefs>
    return {
      fontPercent: Math.min(160, Math.max(70, Number(j.fontPercent) || 100)),
      color: typeof j.color === "string" && /^#[0-9a-fA-F]{6}$/.test(j.color) ? j.color : "#ffffff",
    }
  } catch {
    return { fontPercent: 100, color: "#ffffff" }
  }
}

function saveCaptionsPrefs(p: CaptionsPrefs) {
  try {
    localStorage.setItem(CAPTIONS_PREFS_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

function isAllowedPlaybackRate(n: number): n is (typeof PLAYBACK_RATES)[number] {
  return PLAYBACK_RATES.some((r) => Math.abs(r - n) < 1e-6)
}

function loadPlaybackRate(): number {
  if (typeof window === "undefined") return 1
  try {
    const raw = localStorage.getItem(PLAYBACK_RATE_KEY)
    const n = raw != null ? Number.parseFloat(raw) : 1
    return isAllowedPlaybackRate(n) ? n : 1
  } catch {
    return 1
  }
}

function playbackRateIndex(rate: number): number {
  const i = PLAYBACK_RATES.findIndex((r) => Math.abs(r - rate) < 1e-6)
  return i >= 0 ? i : PLAYBACK_RATES.indexOf(1)
}

function savePlaybackRate(rate: number) {
  try {
    localStorage.setItem(PLAYBACK_RATE_KEY, String(rate))
  } catch {
    /* ignore */
  }
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00"
  const s = Math.floor(sec % 60)
  const m = Math.floor(sec / 60) % 60
  const h = Math.floor(sec / 3600)
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function WatchVideoPlayer({
  movieId,
  chapterId,
  chapter,
  onEnded,
  theater,
  onTheaterToggle,
}: {
  movieId: string
  chapterId: string
  chapter: ChapterSummaryDto | undefined
  onEnded: () => void
  theater: boolean
  onTheaterToggle: () => void
}) {
  const reactId = useId().replace(/:/g, "")
  const shellId = `dm-watch-${reactId}`
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const lastHistoryAt = useRef(0)
  const resumeApplied = useRef(false)

  const [qualities, setQualities] = useState<{ key: string; label: string }[]>([{ key: "720p", label: "720p" }])
  const [quality, setQuality] = useState("720p")
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)

  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null)
  const [resumeSeconds, setResumeSeconds] = useState(0)

  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(false)
  const [captionsPrefs, setCaptionsPrefs] = useState<CaptionsPrefs>({ fontPercent: 100, color: "#ffffff" })
  const [fs, setFs] = useState(false)
  const [pipOk, setPipOk] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState(1)

  const { accessToken } = useAuth()

  const setPlaybackRate = useCallback((rate: number) => {
    const next = isAllowedPlaybackRate(rate) ? rate : 1
    setPlaybackRateState(next)
    savePlaybackRate(next)
    const v = videoRef.current
    if (v) v.playbackRate = next
  }, [])

  const introEnd = chapter?.introSkipEndSeconds ?? null
  const hasSubtitles = chapter?.hasSubtitles === true

  useEffect(() => {
    setCaptionsPrefs(loadCaptionsPrefs())
    setPlaybackRateState(loadPlaybackRate())
    setPipOk(typeof document !== "undefined" && !!document.pictureInPictureEnabled)
  }, [])

  useEffect(() => {
    lastHistoryAt.current = 0
    resumeApplied.current = false
    setResumeSeconds(0)
    setSubtitleUrl(null)
  }, [chapterId])

  useEffect(() => {
    let cancel = false
    ;(async () => {
      const r = await fetch(`${API}/api/chapters/${chapterId}/sources`)
      if (!r.ok || cancel) return
      const sources = (await r.json()) as VideoSourceInfoDto[]
      const ready = sources.filter((s) => s.status === "ready")
      const opts = ready.length
        ? ready.map((s) => ({
            key: mapQualityToParam(s.quality),
            label: formatQualityLabel(s.quality),
          }))
        : [{ key: "720p", label: "720p" }]
      if (!cancel) {
        setQualities(opts)
        setQuality(opts[0]!.key)
      }
    })()
    return () => {
      cancel = true
    }
  }, [chapterId])

  useEffect(() => {
    if (!accessToken) return
    let cancel = false
    ;(async () => {
      const r = await fetch(
        `${API}/api/social/watch-progress?movieId=${encodeURIComponent(movieId)}&chapterId=${encodeURIComponent(chapterId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!r.ok || cancel) return
      const data = (await r.json()) as WatchProgressDto
      if (!cancel) setResumeSeconds(Math.max(0, data.progressSeconds ?? 0))
    })()
    return () => {
      cancel = true
    }
  }, [accessToken, movieId, chapterId])

  const streamAuthHeaders = useMemo(() => {
    const h: Record<string, string> = {}
    if (accessToken) h.Authorization = `Bearer ${accessToken}`
    return h
  }, [accessToken])

  useEffect(() => {
    if (!hasSubtitles) {
      setSubtitleUrl(null)
      return
    }
    let cancel = false
    ;(async () => {
      const r = await fetch(`${API}/api/chapters/${chapterId}/subtitle-url`, {
        headers: streamAuthHeaders,
      })
      if (cancel) return
      if (!r.ok) {
        setSubtitleUrl(null)
        return
      }
      const data = (await r.json()) as { url: string }
      if (!cancel) setSubtitleUrl(data.url)
    })()
    return () => {
      cancel = true
    }
  }, [chapterId, hasSubtitles, streamAuthHeaders])

  useEffect(() => {
    let cancel = false
    setLoading(true)
    setError(null)
    setUrl(null)
    ;(async () => {
      const r = await fetch(
        `${API}/api/chapters/${chapterId}/stream-url?quality=${encodeURIComponent(quality)}`,
        { headers: streamAuthHeaders }
      )
      if (cancel) return
      if (!r.ok) {
        if (r.status === 401) {
          setError("Đăng nhập để xem nội dung trả phí.")
        } else if (r.status === 403) {
          setError(
            "Phim trả phí — cần mua trước khi xem. Mở trang chi tiết phim (nút Mua) rồi quay lại đây."
          )
        } else {
          setError("Không lấy được link phát (chapter chưa có video ready hoặc thiếu cấu hình R2).")
        }
        setLoading(false)
        return
      }
      const data = (await r.json()) as { url: string }
      setUrl(data.url)
      setLoading(false)
    })()
    return () => {
      cancel = true
    }
  }, [chapterId, quality, retryNonce, streamAuthHeaders])

  const postHistory = useCallback(
    (sec: number) => {
      if (!accessToken) return
      const now = Date.now()
      if (now - lastHistoryAt.current < 12_000) return
      lastHistoryAt.current = now
      void fetch(`${API}/api/social/watch-history`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId, chapterId, progressSeconds: Math.floor(sec) }),
      })
    },
    [accessToken, movieId, chapterId]
  )

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }, [])

  const seek = useCallback((sec: number) => {
    const v = videoRef.current
    if (!v || !Number.isFinite(v.duration)) return
    v.currentTime = Math.max(0, Math.min(v.duration, sec))
  }, [])

  const seekDelta = useCallback(
    (d: number) => {
      const v = videoRef.current
      if (!v) return
      seek(v.currentTime + d)
    },
    [seek]
  )

  const skipIntro = useCallback(() => {
    if (introEnd == null || introEnd <= 0) return
    seek(introEnd)
  }, [introEnd, seek])

  const tryFullscreen = useCallback(async () => {
    const el = shellRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) await el.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      /* ignore */
    }
  }, [])

  const tryPip = useCallback(async () => {
    const v = videoRef.current
    if (!v || !document.pictureInPictureEnabled) return
    try {
      if (document.pictureInPictureElement === v) await document.exitPictureInPicture()
      else await v.requestPictureInPicture()
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement)
        return
      if (t instanceof HTMLElement && t.closest('[role="slider"]')) return
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
          e.preventDefault()
          seekDelta(-10)
          break
        case "ArrowRight":
          e.preventDefault()
          seekDelta(10)
          break
        case "f":
          e.preventDefault()
          void tryFullscreen()
          break
        case "m":
          e.preventDefault()
          setMuted((m) => !m)
          break
        case "c":
          e.preventDefault()
          setCaptionsOn((c) => !c)
          break
        case "[":
          e.preventDefault()
          {
            const i = playbackRateIndex(playbackRate)
            const next = i > 0 ? PLAYBACK_RATES[i - 1]! : PLAYBACK_RATES[0]!
            setPlaybackRate(next)
          }
          break
        case "]":
          e.preventDefault()
          {
            const i = playbackRateIndex(playbackRate)
            const next = i < PLAYBACK_RATES.length - 1 ? PLAYBACK_RATES[i + 1]! : PLAYBACK_RATES[PLAYBACK_RATES.length - 1]!
            setPlaybackRate(next)
          }
          break
        default:
          break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [togglePlay, seekDelta, tryFullscreen, setMuted, setCaptionsOn, playbackRate, setPlaybackRate])

  const syncCaptions = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    for (let i = 0; i < v.textTracks.length; i++) {
      v.textTracks[i].mode = captionsOn ? "showing" : "hidden"
    }
  }, [captionsOn])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
    v.muted = muted
  }, [volume, muted, url])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !url) return
    v.playbackRate = playbackRate
  }, [url, playbackRate])

  useEffect(() => {
    syncCaptions()
  }, [syncCaptions, subtitleUrl, url])

  const cueCss = useMemo(
    () => `
#${shellId} video::cue {
  font-size: ${captionsPrefs.fontPercent}%;
  color: ${captionsPrefs.color};
  background-color: rgba(0,0,0,0.55);
}
`,
    [shellId, captionsPrefs.fontPercent, captionsPrefs.color]
  )

  const showSkipIntro =
    introEnd != null && introEnd > 2 && currentTime >= 0.5 && currentTime < introEnd - 0.75

  return (
    <div className={cn("relative bg-black", theater && "flex-1 flex flex-col justify-center")}>
      <style dangerouslySetInnerHTML={{ __html: cueCss }} />
      <div
        ref={shellRef}
        id={shellId}
        className={cn(
          "aspect-video w-full max-h-[75vh] bg-black relative group outline-none ring-0",
          theater && "max-h-none"
        )}
        tabIndex={0}
        role="region"
        aria-label="Trình phát video"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm z-20 pointer-events-none">
            Đang tải video…
          </div>
        )}
        {buffering && !loading && url && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="h-10 w-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 text-sm px-4 text-center z-20">
            <p>{error}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setError(null)
                setRetryNonce((n) => n + 1)
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        )}
        {url && !error && (
          <>
            <video
              ref={videoRef}
              key={url}
              className="w-full h-full object-contain"
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              src={url}
              onEnded={onEnded}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onWaiting={() => setBuffering(true)}
              onPlaying={() => setBuffering(false)}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget
                v.playbackRate = playbackRate
                setDuration(v.duration || 0)
                if (resumeApplied.current) return
                const d = v.duration
                const r = resumeSeconds
                if (r >= 5 && d > 0 && r < d * 0.92) {
                  v.currentTime = r
                }
                resumeApplied.current = true
              }}
              onLoadedData={() => syncCaptions()}
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                setCurrentTime(v.currentTime)
                postHistory(v.currentTime)
              }}
            >
              {subtitleUrl ? (
                <track kind="subtitles" src={subtitleUrl} srcLang="vi" label="Tiếng Việt" />
              ) : null}
            </video>

            {showSkipIntro && (
              <div className="absolute top-3 right-3 z-30">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shadow-lg bg-black/70 hover:bg-black/90 text-white border-white/20"
                  onClick={skipIntro}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Bỏ qua intro
                </Button>
              </div>
            )}

            <div className="absolute inset-0 flex pointer-events-none">
              <button
                type="button"
                aria-label="Tua lại 10 giây"
                className="w-1/3 h-full pointer-events-auto bg-transparent border-0 cursor-pointer"
                onDoubleClick={(ev) => {
                  ev.preventDefault()
                  seekDelta(-10)
                }}
              />
              <button
                type="button"
                aria-label="Phát hoặc tạm dừng"
                className="w-1/3 h-full pointer-events-auto bg-transparent border-0 cursor-pointer"
                onClick={() => togglePlay()}
              />
              <button
                type="button"
                aria-label="Tua tới 10 giây"
                className="w-1/3 h-full pointer-events-auto bg-transparent border-0 cursor-pointer"
                onDoubleClick={(ev) => {
                  ev.preventDefault()
                  seekDelta(10)
                }}
              />
            </div>

            <div
              className={cn(
                "absolute inset-x-0 bottom-0 pt-12 pb-2 px-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent",
                "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity",
                !playing && "opacity-100"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Slider
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                  max={100}
                  step={0.2}
                  className="flex-1 cursor-pointer"
                  onValueChange={([pct]) => {
                    if (!duration) return
                    seek((pct / 100) * duration)
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-white text-xs sm:text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9 shrink-0"
                  onClick={() => togglePlay()}
                  aria-label={playing ? "Tạm dừng" : "Phát"}
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                </Button>
                <span className="tabular-nums text-white/90 min-w-[6rem]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <div className="flex items-center gap-1 max-w-[140px]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 h-8 w-8 shrink-0"
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
                  >
                    {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[muted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    className="w-20"
                    onValueChange={([v]) => {
                      setMuted(false)
                      setVolume(v / 100)
                    }}
                  />
                </div>
                <div className="flex-1" />
                {hasSubtitles && subtitleUrl && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-white hover:bg-white/10 h-8",
                        captionsOn && "bg-white/15"
                      )}
                      onClick={() => setCaptionsOn((c) => !c)}
                      aria-pressed={captionsOn}
                    >
                      <Subtitles className="h-4 w-4 mr-1" />
                      Phụ đề
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8">
                          Kiểu phụ đề
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 space-y-4" align="end">
                        <div className="space-y-2">
                          <Label>Cỡ chữ ({captionsPrefs.fontPercent}%)</Label>
                          <Slider
                            value={[captionsPrefs.fontPercent]}
                            min={70}
                            max={160}
                            step={5}
                            onValueChange={([v]) => {
                              const next = { ...captionsPrefs, fontPercent: v }
                              setCaptionsPrefs(next)
                              saveCaptionsPrefs(next)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`cue-color-${reactId}`}>Màu chữ</Label>
                          <input
                            id={`cue-color-${reactId}`}
                            type="color"
                            value={captionsPrefs.color}
                            className="h-9 w-full rounded border cursor-pointer bg-background"
                            onChange={(e) => {
                              const next = { ...captionsPrefs, color: e.target.value }
                              setCaptionsPrefs(next)
                              saveCaptionsPrefs(next)
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
                {pipOk && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 h-8 w-8"
                    onClick={() => void tryPip()}
                    aria-label="Picture-in-picture"
                  >
                    <PictureInPicture2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => void tryFullscreen()}
                  aria-label={fs ? "Thoát toàn màn hình" : "Toàn màn hình"}
                >
                  {fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-black/80 border-t border-white/10">
        <span className="text-xs text-white/50">Chất lượng</span>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
        >
          {qualities.map((q) => (
            <option key={q.key} value={q.key}>
              {q.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-white/50">Tốc độ</span>
        <select
          value={playbackRate}
          onChange={(e) => setPlaybackRate(Number.parseFloat(e.target.value))}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
          aria-label="Tốc độ phát"
        >
          {PLAYBACK_RATES.map((r) => (
            <option key={r} value={r}>
              {r === 1 ? "1× (bình thường)" : `${r}×`}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" size="sm" onClick={onTheaterToggle}>
          {theater ? "Thoát rạp" : "Chế độ rạp"}
        </Button>
        <span className="text-[10px] sm:text-xs text-white/40 ml-auto">
          Phím tắt: Space/K phát · ←/→ 10s · [ / ] tốc độ · F toàn màn · M tắt tiếng · C phụ đề · đúp trái/phải ±10s
        </span>
      </div>
    </div>
  )
}

function mapQualityToParam(stored: string): string {
  const u = stored.toUpperCase()
  if (u === "SD") return "480p"
  if (u === "HD") return "720p"
  if (u === "4K") return "1080p"
  return stored
}

function formatQualityLabel(stored: string): string {
  const u = stored.toUpperCase()
  if (u === "SD") return "480p"
  if (u === "HD") return "720p"
  if (u === "4K") return "1080p / 4K"
  return stored
}
