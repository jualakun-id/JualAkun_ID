import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="170" height="170" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 1 L39 20 L20 39 L1 20 Z" fill="#1296A8" />
          <path d="M20 1 L39 20 L20 20 Z" fill="white" fillOpacity="0.15" />
          <path
            d="M11 20.5 L17 26.5 L29 13.5"
            stroke="white"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
