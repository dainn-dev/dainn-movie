# Video Upload Workflow

Dùng khi implement bất kỳ feature nào liên quan đến upload hoặc stream video.

## Nguyên tắc bắt buộc

> Video KHÔNG BAO GIỜ đi qua Raspberry Pi 5.
> Pi 5 chỉ xử lý metadata và presigned URLs.
> Video upload thẳng từ browser → Cloudflare R2.
> Video stream thẳng từ Cloudflare R2/CDN → browser.

## Flow: Upload Video

```
User chọn file
    │
    ▼
Frontend gọi API: POST /api/videos/presigned-url
    │  (gửi: filename, content-type, movie_id, chapter_id)
    ▼
ASP.NET Core tạo Cloudflare R2 presigned URL
    │  (URL có TTL 15 phút)
    ▼
Frontend upload file TRỰC TIẾP lên R2 bằng presigned URL
    │  (PUT request đến R2, không qua Pi)
    ▼
Frontend báo API: POST /api/videos/confirm-upload
    │  (gửi: r2_key, chapter_id, quality)
    ▼
API kích hoạt Hangfire job: transcode với FFmpeg
    │  (job chạy background trên Pi)
    ▼
FFmpeg download từ R2, transcode, upload lại R2
    │  (tạo SD/HD/4K versions)
    ▼
Job cập nhật database: video_sources table
```

## Flow: Stream Video

```
User click "Watch Now"
    │
    ▼
Frontend gọi API: GET /api/chapters/{id}/stream-url
    │
    ▼
ASP.NET Core tạo Cloudflare R2 presigned GET URL (hoặc public URL nếu file public)
    │
    ▼
Frontend dùng URL này làm src cho <video> element
    │
    ▼
Browser stream trực tiếp từ Cloudflare CDN
    ← Pi 5 KHÔNG tham gia vào quá trình này ←
```

## Frontend Implementation

```tsx
// components/video-player.tsx
"use client"

interface VideoPlayerProps {
  chapterId: number
  serverId: number
}

export function VideoPlayer({ chapterId, serverId }: VideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/chapters/${chapterId}/stream-url?serverId=${serverId}`)
      .then(r => r.json())
      .then(data => setStreamUrl(data.url))
  }, [chapterId, serverId])

  if (!streamUrl) return <div>Loading...</div>

  return (
    <video
      src={streamUrl}
      controls
      className="w-full rounded-lg"
      preload="metadata"
    />
  )
}
```

## Upload Progress Component

```tsx
"use client"

export function VideoUploader({ chapterId }: { chapterId: number }) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle')

  const handleUpload = async (file: File) => {
    setStatus('uploading')

    // 1. Lấy presigned URL từ API
    const { url, key } = await fetch('/api/videos/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, contentType: file.type, chapterId }),
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json())

    // 2. Upload trực tiếp lên R2
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => setProgress(Math.round((e.loaded / e.total) * 100))
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
    await new Promise((resolve, reject) => {
      xhr.onload = resolve
      xhr.onerror = reject
    })

    // 3. Báo API confirm upload
    setStatus('processing')
    await fetch('/api/videos/confirm-upload', {
      method: 'POST',
      body: JSON.stringify({ key, chapterId }),
      headers: { 'Content-Type': 'application/json' }
    })

    setStatus('done')
  }

  return (
    <div>
      <input type="file" accept="video/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
      {status === 'uploading' && <progress value={progress} max={100} />}
      {status === 'processing' && <p>Đang xử lý video...</p>}
      {status === 'done' && <p>Upload thành công!</p>}
    </div>
  )
}
```

## Cloudflare R2 Key Convention

```
videos/{movie_id}/{chapter_id}/original.{ext}
videos/{movie_id}/{chapter_id}/480p.mp4
videos/{movie_id}/{chapter_id}/720p.mp4
videos/{movie_id}/{chapter_id}/1080p.mp4
```

## Size Limits

- Max file size: 5GB per video (recommend < 2GB)
- Presigned URL TTL: 15 phút cho upload, 1 giờ cho stream
- Supported formats: mp4, mkv, avi, mov (FFmpeg sẽ convert sang mp4)
