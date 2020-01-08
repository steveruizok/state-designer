import React from "react"
import { Box, Text } from "rebass"
import { Edit, Check, MoreHorizontal, X, Plus, RefreshCw } from "react-feather"
import { BottomButton } from "./BottomButton"
import { TopButton } from "./TopButton"

export interface Props {
  id?: string
  title?: string
  titleSize?: number
  canCancel?: boolean
  canSave?: boolean
  draggable?: boolean
  draggableId?: number | string
  draggableIndex?: number
  options?: {
    [key: string]: () => void
  }
  error?: string
  onEdit?: () => void
  onReset?: () => void
  onSave?: () => void
  onCancel?: () => void
  onCreate?: () => void
}

export const Item: React.FC<Props> = ({
  id,
  title,
  titleSize = 2,
  canCancel = false,
  canSave = false,
  error,
  options = {},
  onCreate,
  onSave,
  onCancel,
  onReset,
  onEdit,
  children,
}) => {
  const [hovered, setHovered] = React.useState(false)

  return (
    <Box id={id} p={2} mb={2} maxWidth={560} style={{}}>
      <Box
        p={2}
        onMouseOver={e => {
          e.stopPropagation()
          if (!hovered) setHovered(true)
        }}
        onMouseOut={e => {
          e.stopPropagation()
          if (hovered) setHovered(false)
        }}
        backgroundColor={"background"}
        sx={{
          position: "relative",
          border: `1px solid ${hovered || canCancel ? "#333" : "#bbb"}`,
          borderRadius: 4,
          minHeight: 60,
        }}
      >
        {/*Header*/}
        <ItemHeader
          title={title}
          titleSize={titleSize}
          onDoubleClick={canCancel ? onCancel : onEdit}
        >
          {onCreate && (
            <TopButton onClick={onCreate}>
              <Plus size={16} />
            </TopButton>
          )}
          {onEdit && (
            <TopButton onClick={onEdit}>
              <Edit size={14} />
            </TopButton>
          )}
          {onReset && (
            <TopButton
              sx={{
                zIndex: 2,
                backgroundColor: "background",
              }}
              onClick={onReset}
            >
              <RefreshCw size={20} />
            </TopButton>
          )}
          {Object.keys(options).length > 0 && (
            <TopButton>
              <MoreHorizontal size={16} />
              <select
                value={""}
                onChange={e => options[e.target.value]()}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: 0,
                }}
              >
                <option value=""> </option>
                {Object.keys(options).map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </TopButton>
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
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
          }}
        >
          {children}
        </Box>
        {/*Footer*/}
        <ItemFooter>
          <>
            {canCancel && (
              <BottomButton onClick={onCancel}>
                <X size={16} />
              </BottomButton>
            )}
            {canSave && (
              <BottomButton onClick={error ? undefined : onSave}>
                <Check size={16} opacity={error ? 0.5 : 1} />
              </BottomButton>
            )}
          </>
        </ItemFooter>
      </Box>
    </Box>
  )
}

const ItemHeader: React.FC<{
  onDoubleClick?: () => void
  title?: string
  titleSize?: number
}> = ({ onDoubleClick, title, titleSize = 2, children }) => {
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
        top: -19,
        height: 48,
        userSelect: "none",
      }}
      onDoubleClick={onDoubleClick}
    >
      <Text
        fontFamily="body"
        px={2}
        py={1}
        sx={{
          width: "fit-content",
          backgroundColor: title ? "background" : "none",
          gridRow: 0,
          position: "relative",
          top: -1,
          borderRadius: 4,
          fontSize: titleSize === 2 ? 14 : titleSize === 3 ? 16 : 12,
          fontWeight: titleSize === 2 ? 600 : 800,
          border: title ? "1px solid #aaa" : "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "calc(100% + 4px)",
            height: "100%",
            top: 10,
            left: "-2px",
            backgroundColor: "background",
            border: "1px solid rgb(250, 250, 250)",
            zIndex: 1,
          }}
        />
        <span style={{ zIndex: 2, position: "relative" }}>{title}</span>
      </Text>
      <Box />
      <Box
        sx={{
          display: "grid",
          gridAutoFlow: "column",
          alignItems: "center",
          gridRow: 0,
          gap: 1,
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
        bottom: -10,
        height: 36,
        userSelect: "none",
      }}
    >
      <Box />
      <Box
        sx={{
          display: "grid",
          alignItems: "center",
          gridAutoFlow: "column",
          columnGap: 2,
          gridRow: 0,
          fontSize: 14,
          fontWeight: 400,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
