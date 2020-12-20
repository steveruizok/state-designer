import { base } from "@theme-ui/presets"

const button = {
  bg: "muted",
  color: "text",
  fontFamily: "body",
  borderRadius: 0,
  fontWeight: 600,
  minWidth: 80,
  overflow: "hidden",
  cursor: "pointer",
  "&:active": {
    color: "accent",
  },
  "&:hover": {
    color: "accent",
  },
  "&:disabled": {
    color: "inactive",
  },
  "&:focus": {
    outline: "none",
  },
  "&[data-issuppressed='true']": {
    color: "grey",
  },
}

export default {
  ...base,
  initialColorModeName: "dark",
  space: [0, 4, 8, 12, 16, 32, 64, 128, 256, 512],
  colors: {
    ...base.colors,
    text: "#000",
    muted: "#fafafa",
    background: "#ffffff",
    codeText: "#f8f8f2",
    codeBg: "#282a36",
    codeHl: "#e5ebf1",
    accent: "#F00",
    canvas: "#efefef",
    border: "#000",
    active: "#000",
    inactive: "#bbb",
    root: "rgba(255, 255, 255, .5)",
    node: "rgba(255, 255, 255, .2)",
    scrim: "rgba(0,0,0,.05)",
    Black: "#1a1c2c",
    Purple: "#5d275d",
    Red: "#b13e53",
    Orange: "#ef7d57",
    Yellow: "#ffcd75",
    LightGreen: "#a7f070",
    Green: "#38b764",
    DarkGreen: "#257179",
    DarkBlue: "#29366f",
    Blue: "#3b5dc9",
    LightBlue: "#41a6f6",
    Aqua: "#73eff7",
    White: "#f4f4f4",
    LightGray: "#94b0c2",
    Gray: "#566c86",
    DarkGray: "#333c57",
    modes: {
      dark: {
        text: "#fcfcfa",
        muted: "#242529",
        background: "#202124",
        codeText: "#f8f8f2",
        codeBg: "#282a36",
        codeHl: "#3b3d41",
        accent: "#F00",
        canvas: "#1b1c1e",
        border: "#19181a",
        active: "#fcfcfa",
        inactive: "#75757a",
        grey: "#8f9aac",
        root: "rgba(245, 240, 255, .05)",
        node: "rgba(245, 240, 255, .01)",
        scrim: "rgba(255, 255, 255, .05)",
      },
    },
  },
  borders: {
    outline: "2px solid",
    dashed: "2px dashed",
  },
  fontSizes: [10, 12, 14, 16, 20, 24, 32, 40, 48, 64],
  fonts: {
    heading: "inherit",
    body: '"Fira Sans", sans-serif',
    monospace: "Fira Code, monospace",
  },

  /* --------------------- Styles --------------------- */

  styles: {
    ...base.styles,
    a: {
      cursor: "pointer",
      color: "text",
      textDecoration: "underline",
      "&:visited": {
        color: "text",
      },
      "&:hover": {
        color: "accent",
      },
    },
    root: {
      fontSize: 2,
      fontWeight: 500,
      textShadow: "outline",
      backgroundColor: "background",
      ".inlineCodeHighlight": {
        padding: "2px 0",
        bg: "codeHl",
        fontWeight: "bold",
      },
      ".lineCodeHighlight": {
        bg: "codeHl",
      },
    },
    hr: {
      my: 5,
      borderColor: "muted",
    },
    ul: {
      my: 0,
      pl: 0,
      listStyleType: "none",
    },
    li: {
      pl: 0,
    },
  },

  /* -------------------- Variants -------------------- */
  text: {
    ...base.text,
    contentHeading: {
      fontSize: 2,
    },
    nodeHeading: {
      fontSize: 3,
    },
  },
  cards: {
    node: {
      bg: "node",
      border: "outline",
      borderColor: "active",
      color: "text",
      borderRadius: 12,
      padding: 0,
      m: 2,
      fontSize: 1,
      fontFamily: "monospace",
      overflow: "hidden",
      height: "fit-content",
      minHeight: [null, 64, 64, 96],
      minWidth: 96,
      "&[data-isactive='false']": {
        borderColor: "inactive",
      },
      "&[data-isroot='true']": {
        bg: "root",
      },
    },
    parallelNode: {
      color: "text",
      p: 0,
      fontSize: 1,
      width: "fit-content",
      fontFamily: "monospace",
      "&[data-isactive='false']": {
        borderColor: "inactive",
      },
      "&[data-isroot='true']": {
        bg: "root",
      },
    },
  },
  forms: {
    checkbox: {
      color: "text",
      borderColor: "text",
      outline: "none",
    },
    input: {
      minWidth: 80,
      overflow: "hidden",
      fontFamily: "body",
      fontSize: 2,
      bg: "muted",
      fontWeight: 600,
      border: "none",
      outline: "none",
      "&:hover": {
        color: "accent",
      },
      "&:disabled": {
        color: "inactive",
      },
      "&:focus": {
        color: "text",
        outline: "none",
        bg: "muted",
      },
    },
    select: {
      minWidth: 80,
      overflow: "hidden",
      fontFamily: "body",
      fontSize: 2,
      bg: "muted",
      fontWeight: 600,
      border: "none",
      outline: "none",
      "&:hover": {
        color: "accent",
      },
      "&:disabled": {
        color: "inactive",
      },
      "&:focus": {
        color: "text",
        outline: "none",
        bg: "muted",
      },
    },
  },
  buttons: {
    primary: {
      ...button,
    },
    bright: {
      ...button,
      border: "outline",
      borderColor: "accent",
      color: "accent",
      fontSize: 3,
      "&:active": {
        color: "text",
      },
      "&:hover": {
        color: "text",
      },
    },
    secondary: {
      bg: "muted",
      color: "text",
      fontFamily: "body",
      borderRadius: 0,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      minWidth: 80,
      overflow: "hidden",
      cursor: "pointer",
      "&:hover": {
        color: "accent",
      },
      "&:disabled": {
        color: "inactive",
      },
      "&:focus": {
        color: "text",
        outline: "none",
      },
    },
    icon: {
      outline: "none",
      cursor: "pointer",
      padding: 2,
      "&:active": {
        color: "accent",
      },
      "&:hover": {
        color: "accent",
      },
      "&:disabled": {
        color: "inactive",
      },
      "&:focus": {
        color: "text",
        outline: "none",
      },
    },
    contentRow: {
      py: 2,
      pr: 0,
      pl: 2,
      fontSize: 2,
      fontWeight: "bold",
      fontFamily: "body",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
      borderRadius: 0,
      bg: "transparent",
      color: "text",
      "&:hover": {
        bg: "muted",
      },
      "&:focus": {
        outline: "none",
      },
      "&:disabled": {
        color: "inactive",
      },
    },
    contentEvent: {
      py: 2,
      px: 2,
      fontSize: 2,
      fontWeight: "bold",
      fontFamily: "body",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
      borderRadius: 0,
      bg: "transparent",
      color: "text",
      cursor: "pointer",
      "&:hover": {
        bg: "muted",
      },
      "&:focus": {
        outline: "none",
      },
      "&:disabled": {
        cursor: "not-allowed",
        color: "inactive",
      },
      "& > *[data-hidey='true']": {
        visibility: "hidden",
      },
    },
    nodeEvent: {
      py: 2,
      px: 2,
      fontSize: 1,
      fontWeight: "bold",
      fontFamily: "body",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "fit-content",
      borderRadius: 2,
      bg: "transparent",
      color: "text",
      cursor: "pointer",
      "&:hover": {
        bg: "muted",
      },
      "&:focus": {
        outline: "none",
      },
      "&:disabled": {
        cursor: "not-allowed",
        color: "inactive",
      },
      "& > *[data-hidey='true']": {
        visibility: "hidden",
      },
    },
    tab: {
      fontFamily: "body",
      borderRadius: 0,
      fontWeight: 600,
      minWidth: 80,
      overflow: "hidden",
      cursor: "pointer",
      color: "text",
      bg: "transparent",
      "&:hover": {
        opacity: 1,
      },
      "&:disabled": {
        color: "inactive",
      },
      "&:focus": {
        outline: "none",
      },
      "&[data-issuppressed='true']": {
        opacity: 0.5,
      },
    },
  },
  contentRowItem: {
    bg: "background",
    display: "flex",
    alignItems: "center",
    pr: 1,
    "& button[data-hidey='true']": {
      visibility: "hidden",
    },
    "&:hover": {
      bg: "muted",
    },
    "&:focus": {
      outline: "none",
    },
    "& > *[data-hidey='true']": {
      visibility: "hidden",
    },
    "&:hover:not([disabled]) *[data-hidey='true']": {
      visibility: "visible",
      "&:hover": {
        color: "accent",
      },
    },
  },
  contentHeading: {
    px: 2,
    mb: 2,
    height: 44,
    bg: "muted",
    whiteSpace: "nowrap",
    overflow: "hidden",
    borderBottom: "outline",
    borderColor: "border",
    userSelect: "none",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    "&[data-iscollapsed='false'] > button": {
      visibility: "hidden",
    },
    "&:hover > button": {
      visibility: "visible",
    },
  },
  textarea: {
    fontFamily: "monospace",
    fontSize: 2,
    fontWeight: 500,
    bg: "muted",
    border: "outline",
    borderColor: "border",
    outline: "none",
    "&:hover": {
      color: "accent",
    },
    "&:disabled": {
      color: "inactive",
    },
    "&:focus": {
      color: "text",
      outline: "none",
    },
  },
  nodeHeading: {
    py: 2,
    pl: 3,
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "active",
    "&[data-isactive='false']": {
      borderColor: "inactive",
    },
    "& > *[data-hidey='true']": {
      visibility: "hidden",
    },
    "&:hover > *[data-hidey='true']": {
      visibility: "visible",
    },
  },
  fullView: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    placeItems: "center",
    placeContent: "center",
    textAlign: "center",
    margin: 0,
    flexDirection: "column",
  },
  cardList: {
    minWidth: 240,
    "& ul": {
      listStyleType: "none",
      p: 0,
      mx: 0,
      mt: 0,
      mb: 4,
    },
    "& li": {
      width: "100%",
      fontSize: 3,
      "& a": {
        textDecoration: "none",
        py: 2,
        display: "block",
        width: "100%",
        textAlign: "center",
      },
      "&:hover": {
        bg: "muted",
      },
    },
  },
}
