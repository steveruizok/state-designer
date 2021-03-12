export const defaultTheme = JSON.stringify(`const theme = {
  colors: {
      text: '#000',
      background: '#fff',
      primary: '#11e',
      secondary: '#c0c',
      highlight: '#e0e',
      muted: '#f6f6ff',
      modes: {
          dark: {
              text: '#fff',
              background: '#fff',
              primary: '#0fc',
              secondary: '#0cf',
              highlight: '#f0c',
              muted: '#011',
          },
      },
  },
  fonts: {
      body: '"Avenir Next", system-ui, sans-serif',
      heading: 'inherit',
      monospace: 'Menlo, monospace',
  },
  fontWeights: {
      body: 400,
      heading: 600,
      bold: 700,
  },
  lineHeights: {
      body: 1.75,
      heading: 1.25,
  },
}`)

export const defaultStatics = JSON.stringify(
  `function getStatic() {
    return {
        date: new Date(),
        name: "Shingirayi"
    }
}`
)

export const defaultTests = `"describe(\"Always fail!\", async () => {\n    expect(2).toBe(1)\n  })"`
