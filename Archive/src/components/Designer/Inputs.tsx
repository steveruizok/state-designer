import * as React from "react"
import * as Rebass from "rebass"

export interface Props extends Rebass.ButtonProps {}

export const Button: React.FC<Props> = ({
  disabled = false,
  variant = "buttonStyles.primary",
  ...rest
}) => {
  return (
    <Rebass.Button {...rest} variant={variant} opacity={disabled ? 0.5 : 1} />
  )
}
