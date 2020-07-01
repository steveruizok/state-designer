// @refresh reset
import * as React from "react"
import { Grid, Button, GridProps } from "theme-ui"

export const Segment: React.FC<
  {
    options: string[]
    value: string
    disabled?: boolean
    onChange: (option: string) => void
  } & GridProps
> = ({ value, disabled = false, options, onChange, ...rest }) => {
  return (
    <Grid
      {...rest}
      ref={undefined}
      sx={{
        ...rest.sx,
        borderRadius: 8,
        overflow: "hidden",
        "& > button": {
          borderRadius: "0px 0px 0px 0px",
        },
        width: "100%",
        gridAutoColumns: "1fr",
        gridAutoFlow: "column",
        gap: 0,
      }}
    >
      {options.map((option, i) => (
        <Button
          key={i}
          disabled={disabled}
          sx={{ bg: value === option ? "active" : "muted" }}
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </Grid>
  )
}
