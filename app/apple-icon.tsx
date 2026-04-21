import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0B',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: '#EDE6D7',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            letterSpacing: '-3px',
            lineHeight: 1,
            marginLeft: -6,
          }}
        >
          R
        </span>
        <svg
          width={56}
          height={56}
          viewBox="0 0 32 32"
          fill="none"
          style={{ position: 'absolute', top: 32, right: 32 }}
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
    ),
    size,
  )
}
