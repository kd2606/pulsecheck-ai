import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DiagnoVerse AI'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: '#08090E',
          color: '#F5F7FA',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ color: '#14B8A6', fontSize: 80, fontWeight: 'bold' }}>DiagnoVerse AI</div>
        <div style={{ fontSize: 32, marginTop: 20, color: '#B8BFCC' }}>Rural Health Accessibility Platform</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
