import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background:
          'radial-gradient(circle at top left, rgba(21, 138, 147, 0.18), transparent 35%), radial-gradient(circle at 80% 20%, rgba(255, 180, 92, 0.28), transparent 26%), linear-gradient(180deg, #fcf7ef, #f4ede1)',
        color: '#12373b',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: '-0.04em',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#16747c',
            color: '#fff7ea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          b
        </div>
        best-id Playground
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: '-0.06em',
            lineHeight: 1,
          }}
        >
          Generate.
          <br />
          Parse.
          <br />
          Inspect.
        </div>

        <div
          style={{
            display: 'flex',
            gap: '14px',
            fontSize: 28,
            color: '#36585b',
          }}
        >
          <div>Typed IDs</div>
          <div>UUIDv7</div>
          <div>Base62</div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
