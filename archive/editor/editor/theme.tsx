import { deep } from "@theme-ui/presets"

export default {
  ...deep,
  colors: {
    ...deep.colors,
    primary: "#4679f6",
    secondary: "rgba(51, 76, 143, 1.000)",
    background: "rgba(31, 30, 41, 1.000)",
    tint: "rgba(69, 122, 246, 0.200)",
    text: "#efefef",
    bright: "rgba(245, 240, 255, .36)",
    active: "rgba(245, 240, 255, .18)",
    muted: "rgba(245, 245, 255, .08)",
    low: "rgba(0,0,0, 0.100)",
    deep: "rgba(0,0,0, 0.500)",
    flat: "#0d0d0f",
    panel: "rgba(31, 30, 41, 1.000)",
    surface: "rgba(245, 240, 255, .05)",
  },
  space: [0, 4, 8, 16, 32, 40, 64, 128, 256, 512],
  fontSizes: [10, 12, 14],
  shadows: {
    low: "0px 0px 4px rgba(0,0,0,.18)",
    med: "0px 0px 16px rgba(0,0,0,.16)",
    high: "0px 0px 32px rgba(0,0,0,.12)",
    outline: "",
    // outline:
    //   "-1px -1px 0 #000, 1px -1px 0 #000, 1px 1px 0 #000, -1px 1px 0 #000",
  },
  fonts: {
    body: '"Helvetica Neue", sans-serif',
    heading: "inherit",
    monospace: "Fira Code, monospace",
  },
  styles: {
    ...deep.styles,
    root: {
      fontSize: 2,
      fontWeight: 500,
      textShadow: "outline",
    },
    ul: {
      width: "100%",
      margin: 0,
      padding: 0,
      paddingLeft: 0,
      listStyleType: "none",
    },
    li: {
      m: 0,
      pl: 0,
      pb: 1,
      "&:first-of-type": {
        pt: 1,
      },
    },
    pre: {
      ...deep.styles.pre,
      margin: 0,
      fontSize: 0,
    },
  },
  text: {
    state: {
      name: {
        fontSize: 2,
        backgroundColor: "rgba(0,0,0,.5)",
        paddingTop: 1,
        paddingRight: 2,
        paddingBottom: 1,
        paddingLeft: 2,
      },
      section: {
        fontSize: 1,
        paddingTop: 1,
        paddingBottom: 1,
        marginBottom: 2,
      },
    },
    event: {
      name: {
        fontSize: 0,
        paddingTop: 1,
        paddingBottom: 1,
      },
    },
  },
  buttons: {
    primary: {
      fontFamily: "body",
      textShadow: "outline",
      outline: "transparent",
      cursor: "pointer",
      color: "text",
      "&:disabled": {
        opacity: 0.5,
      },
    },
    icon: {
      cursor: "pointer",
      fontFamily: "body",
      textShadow: "outline",
      outline: "transparent",
      bg: "muted",
      color: "primary",
      height: "100%",
      width: "44px",
      "&:hover": {
        bg: "secondary",
        color: "background",
      },
      "&:disabled": {
        color: "grey",
      },
    },
    link: {
      bg: "transparent",
      textAlign: "left",
      outline: "transparent",
      cursor: "pointer",
      color: "text",
      p: 2,
      ml: -2,
    },
  },
  forms: {
    input: {
      fontFamily: "body",
      textShadow: "outline",
      borderColor: "transparent",
      outline: "transparent",
      bg: "muted",
      "&:focus": {
        bg: "active",
        borderColor: "transparent",
      },
    },
    item: {
      fontFamily: "body",
      textShadow: "outline",
      borderColor: "transparent",
      outline: "transparent",
      m: 0,
      bg: "transparent",
      borderRadius: 0,
      "&:focus": {
        bg: "text",
        color: "background",
        borderColor: "text",
      },
    },
    textarea: {
      fontFamily: "body",
      textShadow: "outline",
      borderColor: "transparent",
      outline: "transparent",
      bg: "muted",
      "&:focus": {
        bg: "active",
        borderColor: "transparent",
      },
    },
    select: {
      fontFamily: "body",
      textShadow: "outline",
      border: "none",
      outline: "transparent",
      bg: "muted",
      cursor: "pointer",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    create: {
      fontFamily: "body",
      textShadow: "outline",
      border: "none",
      outline: "transparent",
      bg: "transparent",
      cursor: "pointer",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    radio: {
      textShadow: "outline",
      "&:disabled": {
        bg: "red",
      },
    },
  },
  cards: {
    editor: {
      state: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridAutoRows: "auto",
        gridRowGap: 2,
        bg: "surface",
        width: "100%",
        borderColor: "grey",
        p: 4,
        mb: 3,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: "high",
        "& > hr": {
          my: 4,
        },
      },
      handler: {
        mx: -3,
        bg: "surface",
        display: "grid",
        px: 3,
        py: 4,
        boxShadow: "med",
        gap: 2,
        borderRadius: 16,
        mb: 3,
        "&:nth-last-of-type": {
          mb: 0,
        },
      },
      link: {
        position: "relative",
        overflow: "hidden",
        display: "grid",
        gap: 1,
        ml: 0,
        mr: 0,
        p: 3,
        bg: "surface",
        boxShadow: "med",
        borderRadius: "0px 8px 8px 8px",
      },
    },
    state: {
      width: "fit-content",
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, .05)",
    },
    states: {
      padding: 1,
      // backgroundColor: "rgba(255, 255, 255, .05)",
    },
    events: {
      padding: 1,
      // backgroundColor: "rgba(255, 255, 255, .05)",
    },
    eventHandler: {
      marginBottom: 2,
      padding: 1,
      backgroundColor: "rgba(255, 255, 255, .05)",
      "& > *": {
        marginBottom: 2,
      },
      "& > *:nth-of-type(n-1)": {
        marginBottom: 0,
      },
    },
    EventHandlerObject: {
      // padding: 1,
      // backgroundColor: "rgba(255, 255, 255, .05)",
    },
    eventFns: {
      marginTop: 2,
      display: "grid",
      gridColumnGap: 1,
      gridTemplateColumns: "min-content auto",
    },
    repeat: {
      padding: 1,
      backgroundColor: "rgba(255, 255, 255, .05)",
      "& > *": {
        marginBottom: 2,
      },
      "& > *:nth-of-type(n-1)": {
        marginBottom: 0,
      },
    },
  },
}
