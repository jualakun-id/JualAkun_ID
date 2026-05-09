import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Jualakun.id'
  const subtitle = searchParams.get('subtitle') ?? 'Anti Mainstream, Tetap Asli.'
  const price = searchParams.get('price')

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0089A8 0%, #1A4480 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 800 }}>
          <span style={{ color: 'white' }}>Jualakun</span>
          <span style={{ color: '#22D3EE' }}>.id</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 24, opacity: 0.85 }}>{subtitle}</div>
          {price ? (
            <div style={{ marginTop: 16, fontSize: 40, fontWeight: 700 }}>
              Rp {Number(price).toLocaleString('id-ID')}
            </div>
          ) : null}
        </div>
        <div style={{ fontSize: 18, opacity: 0.75 }}>jualakun.id</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
