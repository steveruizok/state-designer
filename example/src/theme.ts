export default {
  colors: {
    text: "#000",
    background: "#161616",
    primary: "#fff",
    secondary: "#ccc",
    muted: "#aaa",
    gray: "#777",
    highlight: "hsla(205, 100%, 40%, 0.125)",
    gray05: "#f2f2f2",
    gray10: "#e4e4e3",
    gray20: "#cbcaca",
    gray30: "#b2b2b2",
    gray70: "#4d4c4c",
    gray80: "#333333",
    gray85: "#2d2d2d",
    gray90: "#161616"
  },
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
    heading: 1.25
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: {
    avatar: 48
  },
  radii: {
    default: 4,
    circle: 99999
  },
  shadows: {
    card: "0 0 4px rgba(0, 0, 0, .125)"
  },
  // rebass variants
  text: {
    heading: {
      fontFamily: "heading",
      lineHeight: "heading",
      fontWeight: "heading"
    },
    display: {
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading",
      fontSize: [5, 6, 7]
    },
    caps: {
      textTransform: "uppercase",
      letterSpacing: "0.1em"
    }
  },
  variants: {
    avatar: {
      width: "avatar",
      height: "avatar",
      borderRadius: "circle"
    },
    card: {
      p: 2,
      bg: "gray80",
      boxShadow: "card"
    },
    link: {
      color: "primary"
    },
    nav: {
      fontSize: 1,
      fontWeight: "bold",
      display: "inline-block",
      p: 2,
      color: "inherit",
      textDecoration: "none",
      ":hover,:focus,.active": {
        color: "primary"
      }
    },
    titleRow: {
      bg: "gray85",
      borderStyle: "solid",
      borderColor: "gray90",
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomWidth: 1,
      py: 2,
      px: 1
    },
    rowItem: {
      px: 1,
      py: 2,
      borderBottomWidth: 1,
      borderBottomStyle: "solid",
      borderColor: "gray90"
    }
  },
  buttons: {
    primary: {
      fontSize: 1,
      px: 2,
      fontWeight: "bold",
      color: "background",
      bg: "primary",
      borderRadius: "default"
    },
    disabled: {
      variant: "buttons.primary",
      opacity: 0.5
    },
    outline: {
      variant: "buttons.primary",
      color: "primary",
      bg: "transparent",
      boxShadow: "inset 0 0 2px"
    },
    secondary: {
      variant: "buttons.primary",
      color: "background",
      bg: "secondary"
    }
  },
  styles: {
    root: {
      fontFamily: "body",
      fontWeight: "body",
      lineHeight: "body"
    }
  }
}
