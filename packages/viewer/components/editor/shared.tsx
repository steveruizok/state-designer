// @refresh reset
import * as React from "react"
import { X, Save, Plus, Delete } from "react-feather"
import { useStateDesigner } from "@state-designer/react"
import { GridProps } from "theme-ui"

import { Box, Styled, Select, IconButton, Input, Grid } from "theme-ui"

export const Row: React.FC<GridProps & { columns?: string; ref?: never }> = ({
  columns = "1fr",
  ...rest
}) => {
  return (
    <Grid
      sx={{
        gridTemplateColumns: columns,
        gridAutoColumns: "auto",
        gridAutoFlow: "column",
        alignItems: "center",
      }}
      gap={2}
      mb={2}
      {...rest}
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
      SUBMITTED: ["submitValue", "resetValue"],
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
    readOnly?: boolean
    onSubmit: (value: string) => void
    onDelete: () => void
  } & Pick<
    React.HTMLProps<HTMLInputElement>,
    "onBlur" | "onFocus" | "placeholder"
  >
> = ({ label, defaultValue, readOnly, onSubmit, onDelete, placeholder }) => {
  const { data, send, values, isIn } = useStateDesigner(
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
                  to: "idle",
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
          data.value = payload
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
    <Row columns={label ? "min-content 1fr" : "1fr"}>
      {label}
      <Input
        sx={{ width: "1fr" }}
        value={values.value}
        readOnly={readOnly}
        onBlur={() => send("BLURRED")}
        onFocus={() => send("FOCUSED")}
        placeholder={placeholder}
        onKeyUp={(e) => {
          e.key === "Enter" && send("SUBMITTED")
          e.key === "Escape" && send("CANCELLED")
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
        !readOnly && (
          <IconButton onClick={() => onDelete()}>
            <Delete />
          </IconButton>
        )
      )}
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

export const Column: React.FC<{}> = (props) => {
  return (
    <Grid
      columns={"420px"}
      sx={{ height: "fit-content" }}
      p={4}
      gap={2}
      {...props}
    />
  )
}

export const SectionHeader: React.FC<{}> = (props) => {
  return (
    <Box
      sx={{
        mx: -3,
        px: 3,
        my: 3,
        borderTop: "1px solid #ccc",
        borderBottom: "1px solid #ccc",
        bg: "muted",
        color: "text",
      }}
      {...props}
    />
  )
}
