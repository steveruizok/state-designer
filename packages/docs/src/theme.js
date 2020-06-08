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
  display: "inline-block",
}

export default {
  space: [0, 4, 8, 16, 24, 32, 48, 64, 128, 256, 512],
  breakpoints: ["52em", "90em", "100em"],
  colors: {
    text: "#1d1d1d",
    lowText: "#2d2d2d",
    code: "#272727",
    codeBg: "#eff1f5",
    codeHl: "#eff1f5",
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
  fontSizes: [14, 16, 18, 22, 28, 32, 44, 48, 56, 64],
  fontWeights: {
    body: "400",
    code: "400",
    quote: "400",
    bold: "600",
    heading: "800",
  },
  lineHeights: {
    tight: 1.5,
    body: 1.7,
    heading: 1.25,
    code: 1.65,
  },
  textStyles: {
    heading,
    display: {
      variant: "textStyles.heading",
      fontSize: [7, 8, 8],
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
      fontFamily: "body",
      lineHeight: ["tight", "body"],
      fontWeight: "body",
      fontSize: [3, 2],
    },
    h1: {
      variant: "textStyles.display",
      mt: 0,
      mb: 3,
    },
    h2: {
      variant: "textStyles.heading",
      fontSize: 6,
      mt: 5,
      mb: 2,
    },
    h3: {
      variant: "textStyles.heading",
      fontSize: 4,
      mt: 4,
      mb: 2,
    },
    h4: {
      variant: "textStyles.heading",
      fontSize: 3,
      mt: 3,
      mb: 2,
    },
    h5: {
      variant: "textStyles.heading",
      fontSize: 2,
      mt: 3,
      mb: 2,
    },
    h6: {
      variant: "textStyles.heading",
      fontSize: 2,
      mt: 3,
      mb: 2,
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
      bg: "#f9fafb",
      px: 4,
      py: 2,
      "& code": {
        bg: "codeHl",
      },
      "& pre": {
        bg: "codeHl",
      },
    },
    img: {
      my: 5,
    },
    pre: {
      ...prismTheme,
      variant: "prism",
      maxWidth: "100%",
      tabSize: 2,
      fontFamily: "monospace",
      fontSize: 1,
      p: 3,
      my: 4,
      borderRadius: 4,
      overflow: "scroll",
      scroll: "auto",
      lineHeight: "code",
      code: {
        color: "inherit",
        bg: "inherit",
        border: "none",
        px: 0,
        fontWeight: 500,
        fontSize: 0,
        borderRadius: 0,
      },
    },
    code: {
      fontFamily: "monospace",
      fontSize: "inherit",
      bg: "muted",
      px: 1,
      fontWeight: "inherit",
      letterSpacing: -0.2,
      borderRadius: 4,
      a: {
        color: "primary",
      },
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
      my: 2,
    },
    ol: {
      my: 4,
    },
    li: {
      mb: 2,
    },
  },
  prism: {
    [[".gatsby-highlight-code-line"]]: {
      display: "block",
      color: "text",
      mx: -4,
      px: 4,
      backgroundColor: "codeHl",
    },
  },
}
