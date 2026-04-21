import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#EDE6D7',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            letterSpacing: '-0.5px',
            lineHeight: 1,
            marginLeft: -2,
          }}
        >
          R
        </span>
        <svg
          width={10}
          height={10}
          viewBox="0 0 32 32"
          fill="none"
          style={{ position: 'absolute', top: 6, right: 6 }}
        >
          <path
            d="M 4 28 L 28 4 M 28 4 L 14 4 M 28 4 L 28 18"
            stroke="#1D9E75"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  )
}
