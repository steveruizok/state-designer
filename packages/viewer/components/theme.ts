import { deep } from "@theme-ui/presets"

export default {
  ...deep,
  colors: {
    ...deep.colors,
    primary: "#4679f6",
    secondary: "#4679f6",
    background: "#25243c",
    text: "#efefef",
    muted: "rgba(245, 245, 255, .08)",
    active: "rgba(245, 240, 255, .18)",
    panel: "#25243c",
    surface: "rgba(245, 240, 255, .10)",
    low: "rgba(0,0,0, 0.100)",
  },
  space: [0, 4, 8, 16, 32, 40, 64, 128, 256, 512],
  fontSizes: [10, 12, 14],
  shadows: {
    low: "0px 0px 4px rgba(0,0,0,.18)",
    med: "0px 0px 16px rgba(0,0,0,.16)",
    high: "0px 0px 32px rgba(0,0,0,.12)",
  },
  styles: {
    ...deep.styles,
    root: {
      fontSize: 2,
      fontWeight: 500,
    },
    ul: {
      listStyleType: "none",
      pl: 0,
      margin: 0,
    },
    li: {
      my: 3,
      "&:last-child": {
        marginBottom: 0,
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
      outline: "transparent",
      cursor: "pointer",
      color: "text",
      "&:disabled": {
        opacity: 0.5,
      },
    },
    icon: {
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
  },
  forms: {
    input: {
      borderColor: "transparent",
      outline: "transparent",
      bg: "muted",
      "&:focus": {
        bg: "active",
        borderColor: "transparent",
      },
    },
    select: {
      border: "none",
      outline: "transparent",
      bg: "muted",
    },
    radio: {
      "&:disabled": {
        bg: "red",
      },
    },
  },
  cards: {
    editor: {
      state: {
        bg: "surface",
        width: "100%",
        borderColor: "grey",
        p: 4,
        mb: 3,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: "high",
        "& > *": {
          mb: 3,
        },
        "& > hr": {
          my: 4,
        },
      },
      handler: {
        mx: -3,
        bg: "surface",
        display: "grid",
        p: 3,
        boxShadow: "med",
        gap: 2,
        borderRadius: 16,
      },
      link: {
        position: "relative",
        overflow: "hidden",
        display: "grid",
        gap: 2,
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
