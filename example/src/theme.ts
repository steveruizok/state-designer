const heading = {
  color: "text",
  fontFamily: "heading",
  lineHeight: "heading",
  fontWeight: "heading"
}

export const base = {
  space: [0, 4, 8, 12, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: "system-ui, sans-serif",
    heading: "inherit",
    monospace: "Menlo, monospace"
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125
  },
  colors: {
    text: "#000",
    faded: "#555",
    highlight: "#ffd84c",
    background: "#fff",
    dark: "#1976d2",
    primary: "#1e88e5",
    light: "#efefef",
    secondary: "#30c",
    muted: "#f6f6f6"
  },
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body"
    },
    h1: {
      ...heading,
      fontSize: 5
    },
    h2: {
      ...heading,
      fontSize: 4
    },
    h3: {
      ...heading,
      fontSize: 3
    },
    h4: {
      ...heading,
      fontSize: 2
    },
    h5: {
      ...heading,
      fontSize: 1
    },
    h6: {
      ...heading,
      fontSize: 0
    },
    p: {
      color: "text",
      fontFamily: "body",
      fontWeight: "body",
      lineHeight: "body"
    },
    a: {
      color: "red",
      ":hover": {
        color: "yellow"
      },
      ":visited": {
        color: "green"
      },
      ":active": {
        color: "blue"
      }
    },
    pre: {
      fontFamily: "monospace",
      overflowX: "auto",
      code: {
        color: "inherit"
      }
    },
    code: {
      fontFamily: "monospace",
      fontSize: "inherit"
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0
    },
    th: {
      textAlign: "left",
      borderBottomStyle: "solid"
    },
    td: {
      textAlign: "left",
      borderBottomStyle: "solid"
    },
    img: {
      maxWidth: "100%"
    },
    ul: {
      ml: 0,
      pl: 0,
      my: 1,
      listStyleType: "none"
      // "& ul:nth-of-type(n)": {
      //   borderLeft: "1px solid #aaa"
      // }
    },
    li: {
      ml: 0,
      mb: 2
    }
  },
  graph: {
    event: {
      fontWeight: 600
    }
  },
  buttons: {
    primary: {
      fontWeight: "bold",
      color: "white",
      mr: 2,
      bg: "primary",
      "&:hover": {
        bg: "dark"
      },
      "&:disabled": {
        opacity: 0.5
      }
    },
    secondary: {
      fontWeight: "bold",
      bg: "muted",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "primary",
      color: "faded",
      "&:hover": {
        bg: "light"
      },
      "&:disabled": {
        opacity: 0.5
      }
    },
    flat: {
      background: "none",
      color: "primary",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "primary"
    },
    event: {
      py: 2,
      px: 2,
      fontSize: 1,
      borderRadius: "4px 0 0 4px",
      fontWeight: "500",
      "&:hover": {
        bg: "dark"
      },
      "&:disabled": {
        opacity: 0.5
      }
    }
  },
  text: {
    caps: {
      textTransform: "uppercase",
      letterSpacing: ".2em"
    },
    heading: {
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading"
    },
    display: {
      // extends the text.heading styles
      variant: "text.heading",
      fontSize: [6, 7, 8],
      fontWeight: "display"
    },
    event: {
      fontSize: 1
    },
    label: {
      fontSize: 0,
      py: 2,
      fontWeight: "bold",
      textTransform: "uppercase",
      color: "faded"
    }
  },
  inputs: {
    event: {
      fontFamily: '"Fira code", "Fira Mono", monospace',
      fontSize: 1,
      lineHeight: 1,
      borderLeft: "none",
      borderRight: "none",
      borderColor: "dark",
      borderRadius: "0",
      "&:hover": {
        borderColor: "dark"
      },
      "&:disabled": {
        opacity: 0.5
      }
    }
  },
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: "0 0 4px 1px rgba(0, 0, 0, 0.5)"
    }
  }
}

export default base
