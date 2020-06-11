import { deep } from "@theme-ui/presets"

export default {
  ...deep,
  styles: {
    ...deep.styles,
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
  buttons: {
    primary: {
      "&:disabled": {
        opacity: 0.5,
      },
    },
    icon: {
      bg: "muted",
      color: "text",
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
  cards: {
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
