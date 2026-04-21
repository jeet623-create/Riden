import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Riden — A coordination layer for Thailand'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadSyne(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        },
      },
    )
    const css = await cssRes.text()
    const url = css.match(/src: url\((.+?)\) format\('(woff2|truetype)'\)/)?.[1]
    if (!url) return null
    return await fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function OgImage() {
  const syne = await loadSyne()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0B',
          fontFamily: syne ? 'Syne' : 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span
            style={{
              fontSize: 220,
              fontWeight: 700,
              color: '#EDE6D7',
              letterSpacing: '-4.4px',
              lineHeight: 1,
            }}
          >
            Riden
          </span>
          <svg
            width={96}
            height={96}
            viewBox="0 0 32 32"
            fill="none"
            style={{ marginLeft: 16, marginTop: 30 }}
          >
            <path
              d="M 4 28 L 28 4 M 28 4 L 14 4 M 28 4 L 28 18"
              stroke="#1D9E75"
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 32,
            color: 'rgba(237, 230, 215, 0.6)',
            fontWeight: 500,
            letterSpacing: '-0.5px',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          An innovation approach to Thailand
        </div>
      </div>
    ),
    {
      ...size,
      fonts: syne
        ? [{ name: 'Syne', data: syne, style: 'normal', weight: 700 }]
        : undefined,
    },
  )
}
