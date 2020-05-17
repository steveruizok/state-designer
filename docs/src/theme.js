import prismTheme from "@theme-ui/prism/presets/github"
import "./styles.css"

const heading = {
  fontFamily: "heading",
  fontWeight: "heading",
  lineHeight: "heading",
  a: {
    color: "inherit",
    textDecoration: "none",
  },
}

export default {
  space: [0, 4, 8, 16, 24, 32, 48, 64, 128, 256, 512],
  breakpoints: ["52em", "90em", "100em"],
  colors: {
    text: "#000",
    code: "#272727",
    codeBg: "#f6f8fa",
    codeHl: "#ebecee",
    muted: "#f6f8fa",
    background: "#fff",
    primary: "#3333ff",
    secondary: "#8855ff",
    highlight: "#03d8ff",
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
  fontSizes: [12, 15, 16, 18, 22, 24, 32, 44, 56],
  fontWeights: {
    body: "400",
    quote: "400",
    heading: "800",
    bold: "600",
  },
  lineHeights: {
    body: 1.8,
    heading: 1.25,
  },
  textStyles: {
    heading,
    display: {
      variant: "textStyles.heading",
      fontSize: [7, 7, 8],
      mt: 3,
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
    Container: {
      p: 3,
      maxWidth: 1024,
    },
    root: {
      fontFamily: "'IBM Plex Sans', sans-serif",
      lineHeight: "body",
      fontWeight: "body",
      fontSize: 3,
    },
    h1: {
      variant: "textStyles.display",
    },
    h2: {
      variant: "textStyles.heading",
      fontSize: 5,
    },
    h3: {
      variant: "textStyles.heading",
      fontSize: 4,
    },
    h4: {
      variant: "textStyles.heading",
      fontSize: 3,
    },
    h5: {
      variant: "textStyles.heading",
      fontSize: 2,
    },
    h6: {
      variant: "textStyles.heading",
      fontSize: 1,
    },
    a: {
      color: "primary",
      textDecoration: "none",
      "& > h1,h2,h3,h4,h5,h6": {
        color: "text",
        "&:hover": {
          color: "code",
        },
      },
    },
    blockquote: {
      mx: 0,
      mt: 4,
      mb: 5,
      border: (theme) => `1px solid ${theme.colors.gray}`,
      fontFamily: "quote",
      fontWeight: "quote",
      fontSize: 2,
      bg: "codeBg",
      px: 4,
      py: 2,
      "& code": {
        bg: "codeHl",
      },
      "& pre": {
        bg: "codeHl",
      },
    },
    pre: {
      ...prismTheme,
      variant: "prism",
      maxWidth: "100%",
      tabSize: 2,
      fontFamily: "monospace",
      fontSize: 1,
      p: 3,
      borderRadius: 4,
      overflow: "scroll",
      scroll: "auto",
      code: {
        color: "inherit",
        bg: "inherit",
        border: "none",
        px: 0,
        fontWeight: 500,
        fontSize: 1,
        borderRadius: 0,
      },
    },
    code: {
      fontFamily: "monospace",
      fontSize: 2,
      color: "code",
      bg: "codeBg",
      fontWeight: 500,
      // fontSize: 1,
      // border: '1px solid #efefef',
      px: 1,
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
      mx: "auto",
      my: 4,
    },
    ul: {
      my: 2,
    },
    ol: {
      my: 4,
    },
    li: {
      mb: 2,
    },
    p: {},
  },
  prism: {
    [[".gatsby-highlight-code-line"]]: {
      display: "block",
      fontWeight: 600,
      mx: -4,
      px: 4,
      backgroundColor: "codeHl",
    },
  },
}
