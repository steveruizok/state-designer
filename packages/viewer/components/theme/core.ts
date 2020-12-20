import { createStyled } from "@stitches/react"

export const { styled, css } = createStyled({
  tokens: {
    colors: {
      $text: "#000",
      $muted: "#fafafa",
      $background: "#ffffff",
      $codeText: "#f8f8f2",
      $codeBg: "#282a36",
      $codeHl: "#e5ebf1",
      $accent: "#ff0000",
      $canvas: "#efefef",
      $border: "#000",
      $active: "#000",
      $inactive: "#bbb",
      $root: "rgba(255, 255, 255, .5)",
      $node: "rgba(255, 255, 255, .2)",
      $scrim: "rgba(0,0,0,.05)",
      $Black: "#1a1c2c",
      $Purple: "#5d275d",
      $Red: "#b13e53",
      $Orange: "#ef7d57",
      $Yellow: "#ffcd75",
      $LightGreen: "#a7f070",
      $Green: "#38b764",
      $DarkGreen: "#257179",
      $DarkBlue: "#29366f",
      $Blue: "#3b5dc9",
      $LightBlue: "#41a6f6",
      $Aqua: "#73eff7",
      $White: "#f4f4f4",
      $LightGray: "#94b0c2",
      $Gray: "#566c86",
      $DarkGray: "#333c57",
    },
    lineHeights: {
      $ui: "1",
      $header: "1.2",
      $body: "1.5",
    },
    space: {
      $0: "4px",
      $1: "8px",
      $2: "16px",
      $3: "24px",
      $4: "32px",
      $5: "40px",
      $6: "48px",
      $7: "64px",
      $8: "80px",
      $9: "96px",
      $10: "128px",
    },
    fontSizes: {
      $0: "13px",
      $1: "16px",
      $2: "18px",
      $3: "20px",
      $4: "24px",
      $5: "28px",
      $6: "36px",
      $code: "16px",
    },
    fontWeights: {
      $0: "light",
      $1: "normal",
      $2: "bold",
    },
    fonts: {
      $body: "'Fira Sans', system-ui, sans-serif",
      $ui: "'Fira Sans', system-ui, sans-serif",
      $heading: "'Fira Sans', system-ui, sans-serif",
      $display: "'Fira Sans', system-ui, sans-serif",
      $monospace: "'Fira Mono', monospace",
    },
  },
  breakpoints: {},

  utils: {
    m: () => (value: number | string) => ({
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }),
    mt: () => (value: number | string) => ({
      marginTop: value,
    }),
    mr: () => (value: number | string) => ({
      marginRight: value,
    }),
    mb: () => (value: number | string) => ({
      marginBottom: value,
    }),
    ml: () => (value: number | string) => ({
      marginLeft: value,
    }),
    mx: () => (value: number | string) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: () => (value: number | string) => ({
      marginTop: value,
      marginBottom: value,
    }),
    p: () => (value: number | string) => ({
      paddingTop: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
      padding: value,
    }),
    pt: () => (value: number | string) => ({
      paddingTop: value,
    }),
    pr: () => (value: number | string) => ({
      paddingRight: value,
    }),
    pb: () => (value: number | string) => ({
      paddingBottom: value,
    }),
    pl: () => (value: number | string) => ({
      paddingLeft: value,
    }),
    px: () => (value: number | string) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: () => (value: number | string) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    size: () => (value: number | string) => ({
      width: value,
      height: value,
    }),
    bg: () => (value: string) => ({
      backgroundColor: value,
    }),
    fadeBg: () => (value: number) => ({
      transition: `background-color ${value}s`,
    }),
  },
})

export const darkTheme = css.theme({
  colors: {
    $text: "#fcfcfa",
    $muted: "#242529",
    $background: "#202124",
    $codeText: "#f8f8f2",
    $codeBg: "#282a36",
    $codeHl: "#3b3d41",
    $accent: "#F00",
    $canvas: "#1b1c1e",
    $border: "#19181a",
    $active: "#fcfcfa",
    $inactive: "#75757a",
    $root: "rgba(245, 240, 255, .05)",
    $node: "rgba(245, 240, 255, .01)",
    $scrim: "rgba(255, 255, 255, .05)",
  },
})

css.global({
  "*": {
    boxSizing: "border-box",
  },
  body: {
    fontFamily: "$body",
    fontWeight: "$2",
    color: "$text",
  },
  a: {},
  h1: {},
  h2: {},
  h3: {},
  h4: {},
  h5: {},
  h6: {},
  p: {},
})
