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
        <svg width="140" height="140" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 3 L37 20 L20 37 L3 20 Z" fill="#0089A8" />
          <path d="M20 3 L37 20 L20 20 Z" fill="white" fillOpacity="0.15" />
          <path
            d="M12 20.5 L17.5 26 L28 14"
            stroke="white"
            strokeWidth="3.5"
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
