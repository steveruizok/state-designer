import prism from "@theme-ui/prism/presets/theme-ui"
import prismtheme from "@theme-ui/prism/presets/dracula.json"
import "./styles.css"

const heading = {
  fontFamily: "heading",
  fontWeight: "heading",
  lineHeight: "heading",
  a: {
    color: "inherit",
    textDecoration: "none",
  },
  display: "inline-block",
}

export default {
  space: [0, 4, 8, 16, 24, 32, 48, 64, 128, 256, 512],
  breakpoints: ["50em", "90em", "100em"],
  colors: {
    flat: "#0d0d0f",
    text: "#1d1d20",
    lowText: "#2d2d30",
    code: "#272727",
    codeBg: "#282a36",
    codeHl: "#f8f8fa",
    muted: "#f2f2f5",
    quote: "#f0f0f3",
    background: "#fff9f9",
    primary: "#0043b8",
    secondary: "#8855ff",
    highlight: "#03d8ff",
    dim: "rgba(0,0,0,.2)",
    gray: "#d8dde3",
  },
  shadows: {
    modal: "0px 2px 26px rgba(0,0,0,.25)",
  },
  fonts: {
    body: "'Fira Sans', sans-serif",
    quote: "'Fira Sans', sans-serif",
    heading: "'Fira Sans', sans-serif",
    monospace: "'Fira Code', monospace",
  },
  fontSizes: [14, 16, 18, 22, 28, 32, 41, 48, 56, 64],
  fontWeights: {
    body: "400",
    code: "500",
    quote: "400",
    bold: "600",
    heading: "800",
  },
  lineHeights: {
    tight: 1.5,
    body: 1.5,
    heading: 1.25,
    code: 1.5,
  },
  textStyles: {
    heading,
    display: {
      variant: "textStyles.heading",
      fontSize: [6, 6, 7],
    },
  },
  borderStyles: {
    quote: "1px solid secondary",
  },
  links: {
    definition: {
      color: "#FF0000",
      textTransform: "uppercase",
    },
  },
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: ["tight", "body"],
      fontWeight: "body",
      fontSize: [2, 2],
    },
    Container: {
      p: 3,
      maxWidth: 1024,
    },
    h1: {
      variant: "textStyles.display",
      mt: 0,
      mb: [2, 2, 3],
    },
    h2: {
      variant: "textStyles.heading",
      fontSize: 4,
      mt: 5,
      mb: 2,
    },
    h3: {
      variant: "textStyles.heading",
      fontSize: 3,
      mt: 5,
      mb: 0,
    },
    h4: {
      variant: "textStyles.heading",
      fontSize: 3,
      mt: 4,
      mb: 0,
    },
    h5: {
      variant: "textStyles.heading",
      fontSize: 2,
      mt: 4,
      mb: 0,
    },
    h6: {
      variant: "textStyles.heading",
      fontSize: 2,
      mt: 3,
      mb: 0,
    },
    a: {
      color: "primary",
      textDecoration: "underline",
      "& > h1,h2,h3,h4,h5,h6": {
        color: "text",
        "&:hover": {
          color: "code",
        },
      },
      "& > code": {
        color: "primary",
      },
    },
    p: {
      mt: 4,
      mb: 0,
    },
    blockquote: {
      mt: 4,
      mb: 5,
      pt: 2,
      pb: 5,
      px: 4,
      border: (theme) => `1px solid ${theme.colors.gray}`,
      fontFamily: "quote",
      fontWeight: "quote",
      fontSize: 2,
      bg: "quote",
      mx: [-3, 0, 0],
      borderRadius: [0, 4, 4],
      "& > p > code": {
        bg: "codeHl",
      },
      "& pre > code": {
        bg: "none",
      },
    },
    img: {
      my: 5,
    },
    inlineCode: {
      bg: "muted",
      px: 1,
      py: 0,
      borderRadius: 4,
      color: "code",
      letterSpacing: -0.5,
      fontFamily: "monospace",
    },
    pre: {
      tabSize: 2,
      fontFamily: "monospace",
      fontSize: 1,
      px: 0,
      py: 0,
      my: 0,
      mx: [-3, 0, 0],
      borderRadius: [0, 4, 4],
      overflow: "scroll",
      scroll: "auto",
      lineHeight: "code",
      bg: "codeBg",
      variant: "prism",
    },
    code: {
      ...prismtheme,
      fontFamily: "monospace",
      fontSize: "inherit",
      fontWeight: "inherit",
      letterSpacing: -0.5,
      borderRadius: 4,
    },
    table: {
      width: "100%",
      my: 4,
      borderCollapse: "separate",
      borderSpacing: 0,
      [["th", "td"]]: {
        textAlign: "left",
        py: "4px",
        pr: "4px",
        pl: 0,
        borderColor: "muted",
        borderBottomStyle: "solid",
      },
      code: {
        mx: -1,
      },
    },
    th: {
      verticalAlign: "bottom",
      borderBottomWidth: "2px",
    },
    td: {
      verticalAlign: "top",
      borderBottomWidth: "1px",
    },
    hr: {
      border: 0,
      borderBottom: (theme) => `1px solid ${theme.colors.gray}`,
      ml: 0,
      my: 5,
    },
    ul: {
      mt: 4,
    },
    ol: {
      mt: 4,
    },
    li: {
      mb: 2,
    },
  },
  xray: {
    "*": {
      outline: "1px solid rgba(0, 192, 255, .25)",
    },
  },
  prism: {
    ...prism,
    px: 3,
    py: 2,
    my: 4,
    ".highlight": {
      mx: -3,
      px: 3,
      background: "rgba(0,0,0,.5) !important",
    },
  },
}
