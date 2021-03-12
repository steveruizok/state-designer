import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import { SelectOptionHeader } from "../shared"
import { MoreHorizontal } from "react-feather"
import { Menu } from "react-feather"
import { Styled, Box, Grid, Flex, Select, BoxProps } from "theme-ui"

export const PanelSelectItem: React.FC<
  {
    depth?: number
    icon?: "circle" | "disc"
    value: string
    menuOptions?: {
      title: string
      functions: Record<string, null | ((input: HTMLInputElement) => void)>
    }
    onChange?: (value: string) => void
  } & BoxProps
> = ({ value, sx, menuOptions, depth = 0, icon, onChange, children }) => {
  const [isHovered, setHovered] = React.useState(false)

  const rInput = React.useRef<HTMLInputElement>()

  return (
    <Styled.li sx={sx}>
      <Grid
        sx={{
          gridTemplateColumns: "40px 1fr 40px",
          width: "100%",
          py: 0,
          pl: 0,
          pr: 1,
          gap: 0,
          border: "1px solid",
          borderColor: "transparent",
          bg: "transparent",
          "&:hover": {
            bg: "tint",
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Menu size={12} />
        </Flex>
        <Select
          sx={{ width: "100%" }}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        >
          {children}
        </Select>
        {menuOptions && (
          <Box
            sx={{
              ml: 0,
              opacity: isHovered ? 1 : 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "pointer",
            }}
          >
            <select
              style={{
                cursor: "pointer",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
              }}
              value={""}
              onChange={(e) => {
                const input = rInput.current
                const fn = menuOptions.functions[e.target.value]
                fn && fn(input)
              }}
            >
              <SelectOptionHeader>{menuOptions.title}</SelectOptionHeader>
              {Object.entries(menuOptions.functions).map(([key, value], i) => (
                <option key={i} value={key} disabled={value === null}>
                  {key}
                </option>
              ))}
            </select>
            <MoreHorizontal
              style={{ pointerEvents: "none", marginLeft: 8, marginRight: 8 }}
            />
          </Box>
        )}
      </Grid>
    </Styled.li>
  )
}
