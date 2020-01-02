import React from "react"
import { Box, Text } from "rebass"
import { Code, Check, MoreHorizontal, X, Plus } from "react-feather"
import { Draggable } from "react-beautiful-dnd"

export interface Props {
  title?: string
  titleSize?: number
  editing?: boolean
  dirty?: boolean
  draggable?: boolean
  draggableId?: number | string
  draggableIndex?: number
  options?: string[]
  error?: string
  onSave?: () => void
  onCancel?: () => void
  onMoreSelect?: (value: string) => void
  onCreate?: () => void
}

export const Item: React.FC<Props> = ({
  title,
  titleSize = 2,
  editing = false,
  dirty = false,
  error,
  options = [],
  onCreate,
  onSave,
  onCancel,
  onMoreSelect = v => {
    console.log(v)
  },
  children
}) => {
  const [hovered, setHovered] = React.useState(false)

  return (
    <Box m={1} mb={2} p={2} maxWidth={560} backgroundColor={"background"}>
      <Box
        p={2}
        sx={{
          position: "relative",
          border: `1px solid ${editing ? "#333" : "#aaa"}`,
          borderRadius: 4,
          minHeight: 60
        }}
      >
        {/*Header*/}
        <ItemHeader title={title} titleSize={titleSize}>
          {onCreate && (
            <Box
              sx={{
                zIndex: 2,
                backgroundColor: "background"
              }}
              onClick={onCreate}
            >
              <Plus size={20} />
            </Box>
          )}
          {options.length > 0 && (
            <Box width={20} sx={{ position: "relative" }}>
              <MoreHorizontal size={20} />
              <select
                value={""}
                onChange={e => onMoreSelect(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: 0
                }}
              >
                <option value=""> </option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Box>
          )}
        </ItemHeader>
        {/*Body*/}
        <Box
          p={2}
          py={3}
          sx={{
            display: "grid",
            gridAutoFlow: "row",
            gap: 2,
            overflow: "hidden"
          }}
        >
          {children}
        </Box>
        {/*Footer*/}
        <ItemFooter>
          <>
            {editing && <X size={20} onClick={onCancel} />}
            {dirty && (
              <Check
                size={20}
                onClick={error ? undefined : onSave}
                opacity={error ? 0.5 : 1}
              />
            )}
          </>
        </ItemFooter>
      </Box>
    </Box>
  )
}

const ItemHeader: React.FC<{ title?: string; titleSize?: number }> = ({
  title,
  titleSize = 2,
  children
}) => {
  return (
    <Box
      p={2}
      sx={{
        display: "grid",
        width: "100%",
        gridTemplateColumns: "auto 1fr",
        gridAutoColumns: "",
        gridAutoFlow: "column",
        alignItems: "center",
        lineHeight: 1,
        position: "absolute",
        left: 0,
        top: -20,
        height: 40,
        userSelect: "none"
      }}
    >
      <Text
        fontFamily="body"
        px={2}
        sx={{
          width: "fit-content",
          backgroundColor: "background",
          gridRow: 0,
          fontSize: titleSize === 2 ? 14 : titleSize === 3 ? 16 : 12,
          fontWeight: titleSize === 2 ? 600 : 800
        }}
      >
        {title}
      </Text>
      <Box />
      <Box
        px={2}
        sx={{
          display: "grid",
          gridAutoFlow: "column",
          alignItems: "center",
          gap: 2,
          backgroundColor: "background",
          gridRow: 0
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

const ItemFooter: React.FC<{}> = ({ children }) => {
  return (
    <Box
      p={2}
      sx={{
        position: "absolute",
        left: 0,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridAutoColumns: "fit-content",
        gridAutoFlow: "column",
        alignItems: "center",
        lineHeight: 1,
        bottom: -18,
        height: 36,
        userSelect: "none"
      }}
    >
      <Box />
      <Box
        px={2}
        sx={{
          display: "grid",
          alignItems: "center",
          gridAutoFlow: "column",
          columnGap: 2,
          backgroundColor: "background",
          gridRow: 0,
          fontSize: 14,
          fontWeight: 400
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
