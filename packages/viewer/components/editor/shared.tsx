// @refresh reset
import * as React from "react"
import { X, Save, Plus, Delete } from "react-feather"
import { useStateDesigner } from "@state-designer/react"

import {
  Box,
  Styled,
  Button,
  Select,
  IconButton,
  Input,
  Grid,
  BoxProps,
  Divider,
  GridProps,
  Heading,
} from "theme-ui"

export const Row: React.FC<GridProps & { columns?: string; ref?: never }> = ({
  columns = "1fr",
  ...rest
}) => {
  return (
    <Grid
      gap={2}
      mb={2}
      {...rest}
      sx={{
        gridTemplateColumns: columns,
        gridAutoColumns: "auto",
        gridAutoFlow: "column",
        alignItems: "center",
        ...rest.sx,
      }}
    />
  )
}

export const CreateRow: React.FC<{
  defaultValue: string
  placeholder: string
  format?: (value: string) => string
  onSubmit: (value: string) => void
}> = ({ defaultValue, placeholder, onSubmit, format }) => {
  const { send, values } = useStateDesigner({
    data: {
      value: defaultValue,
    },
    on: {
      CHANGED_VALUE: "setValue",
      SUBMITTED: { unless: "valueIsEmpty", do: ["submitValue", "resetValue"] },
    },
    actions: {
      resetValue(data) {
        data.value = defaultValue
      },
      submitValue(data) {
        onSubmit(data.value)
        data.value = ""
      },
      setValue(data, payload) {
        data.value = format !== undefined ? format(payload) : payload
      },
    },
    conditions: {
      valueIsEmpty(data) {
        return data.value === ""
      },
    },
    values: {
      value(data) {
        return data.value || ""
      },
    },
  })

  return (
    <Row>
      <Input
        sx={{ width: "100%" }}
        value={values.value}
        placeholder={placeholder}
        onKeyPress={(e) => e.key === "Enter" && send("SUBMITTED")}
        onChange={(e) => send("CHANGED_VALUE", e.target.value)}
      />
      <IconButton onClick={() => send("SUBMITTED")}>
        <Plus />
      </IconButton>
    </Row>
  )
}

export const InputRow: React.FC<
  {
    label?: string
    defaultValue: string
    format?: (value: string) => string
    readOnly?: boolean
    onSubmit: (value: string) => void
    optionsButton?: React.ReactNode
  } & Pick<
    React.HTMLProps<HTMLInputElement>,
    "onBlur" | "onFocus" | "placeholder"
  >
> = ({
  label,
  defaultValue,
  readOnly,
  onSubmit,
  format,
  placeholder,
  optionsButton,
}) => {
  const { send, values, isIn } = useStateDesigner(
    {
      data: { value: defaultValue },
      initial: "idle",
      states: {
        idle: {
          on: { FOCUSED: { unless: () => readOnly, to: "editing" } },
        },
        editing: {
          on: {
            CHANGED_VALUE: {
              if: "valueIsClean",
              to: "clean",
              else: { to: "dirty" },
            },
            CANCELLED: {
              do: "resetValue",
              to: "idle",
            },
          },
          initial: "clean",
          states: {
            clean: {
              on: {
                BLURRED: { to: "idle" },
              },
            },
            dirty: {
              on: {
                SUBMITTED: {
                  do: "submitValue",
                },
              },
            },
          },
        },
      },
      on: {
        CHANGED_VALUE: "setValue",
      },
      conditions: {
        valueIsClean(data) {
          return data.value === defaultValue
        },
      },
      actions: {
        resetValue(data) {
          data.value = defaultValue
        },
        submitValue(data) {
          onSubmit(data.value)
        },
        setValue(data, payload) {
          data.value = format ? format(payload) : payload
        },
      },
      values: {
        value(data) {
          return data.value || ""
        },
      },
    },
    [defaultValue]
  )

  return (
    <Row columns={label ? "56px 1fr" : "1fr"}>
      {label}
      <Input
        sx={{ width: "1fr" }}
        value={values.value}
        readOnly={readOnly}
        onBlur={() => send("BLURRED")}
        onFocus={() => send("FOCUSED")}
        placeholder={placeholder}
        onKeyUp={(e) => {
          switch (e.key) {
            case "Enter": {
              send("SUBMITTED")
              e.currentTarget.blur()
              break
            }
            case "Escape": {
              send("CANCELLED")
              e.currentTarget.blur()
              break
            }
            default: {
            }
          }
        }}
        onChange={(e) => send("CHANGED_VALUE", e.target.value)}
      />
      {isIn("editing") ? (
        <>
          <IconButton
            disabled={!isIn("dirty")}
            onClick={() => send("SUBMITTED")}
          >
            <Save />
          </IconButton>
          <IconButton onClick={() => send("CANCELLED")}>
            <X />
          </IconButton>
        </>
      ) : (
        optionsButton
      )}
    </Row>
  )
}

export const ButtonRow: React.FC<{
  onClick: () => void
  label: string
  onDelete: () => void
}> = ({ onClick, onDelete, label }) => {
  return (
    <Row columns="1fr min-content">
      <Button bg="muted" onClick={() => onClick()}>
        {label}
      </Button>
      <IconButton onClick={() => onDelete()}>
        <Delete />
      </IconButton>
    </Row>
  )
}

export const SelectRow: React.FC<{
  onSubmit: (value: string) => void
  defaultValue: string | null
  options: { value: string; label: string }[]
}> = ({ defaultValue, onSubmit, options }) => {
  const [state, setState] = React.useState(defaultValue || "")

  return (
    <Row>
      <Select
        defaultValue={defaultValue}
        onChange={(e) => {
          setState(e.target.value)
        }}
        disabled={options.length === 0}
      >
        <option></option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <IconButton disabled={state === ""} onClick={() => onSubmit(state)}>
        <Plus />
      </IconButton>
    </Row>
  )
}

export const ListItemRow: React.FC<{ label: string; onDelete: () => void }> = ({
  label,
  onDelete,
}) => {
  return (
    <Row>
      {label}
      <IconButton onClick={() => onDelete()}>
        <Delete />
      </IconButton>
    </Row>
  )
}

export const ListRow: React.FC<{}> = ({ children }) => {
  return (
    <Row>
      <Styled.ul>{children}</Styled.ul>
    </Row>
  )
}

export const Column: React.FC<BoxProps> = ({ children, ...rest }) => {
  return (
    <Box
      {...rest}
      sx={{
        px: 3,
        width: "100%",
        height: ["auto", "100vh"],
        overflowY: "scroll",
        ...rest.sx,
      }}
    >
      <Grid sx={{ height: "fit-content" }} py={3} gap={2}>
        {children}
      </Grid>
    </Box>
  )
}

export const SectionHeader: React.FC<{}> = ({ children }) => {
  return (
    <Box my={4}>
      <Divider mx={-4} />
      <Heading>{children}</Heading>
    </Box>
  )
}

export const DragHandle: React.FC<BoxProps> = ({ children, ...rest }) => (
  <Box
    {...rest}
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      height: 16,
      width: 16,
      borderColor: "muted",
      ...rest.sx,
      "&:hover": {
        borderColor: "primary",
        borderRight: "8px solid transparent",
        borderBottom: "8px solid transparent",
      },
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 16,
        width: 16,
        borderTop: "8px solid",
        borderLeft: "8px solid",
        borderColor: "inherit",
        borderRight: "8px solid transparent",
        borderBottom: "8px solid transparent",
        cursor: "pointer",
      }}
    />
    {children}
  </Box>
)

export const SelectOptionHeader: React.FC = ({ children }) => {
  return (
    <>
      <option value="" disabled>
        {children}
      </option>
      <option disabled>─</option>
    </>
  )
}
