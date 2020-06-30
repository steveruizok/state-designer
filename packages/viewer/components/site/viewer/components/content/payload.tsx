// @jsx jsx
import * as React from "react"
import { Grid, Button, Select, Textarea, Flex, jsx } from "theme-ui"
import { PlayCircle, AlertOctagon } from "react-feather"
import { Project } from "../../states"

const Payload: React.FC<{
  can: typeof Project.can
  eventNames: string[]
  payloads: Record<string, string>
  setPayloads: React.Dispatch<React.SetStateAction<Record<string, string>>>
}> = ({ can, payloads, setPayloads, eventNames }) => {
  const [selectedEvent, setSelectedEvent] = React.useState<string>(
    eventNames[0] || ""
  )
  const [inputIsValid, setInputIsValid] = React.useState(true)
  const [inputError, setInputError] = React.useState("")

  return (
    <Grid
      sx={{
        gridTemplateColumns: "1fr",
        gridTemplateRows: "40px 80px 40px 16px",
        p: 2,
        pb: 0,
      }}
    >
      <Select
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.currentTarget.value)}
      >
        {eventNames.map((eventName, i) => (
          <option key={i}>{eventName}</option>
        ))}
      </Select>
      <Textarea
        sx={{
          height: "100%",
          width: "100%",
          fontFamily: "monospace",
          bg: "none",
        }}
        style={{ margin: 0 }}
        autoCapitalize="false"
        autoComplete="false"
        placeholder="Payload"
        value={payloads[selectedEvent] || ""}
        onChange={(e) => {
          setPayloads({
            ...payloads,
            [selectedEvent]: e.target.value,
          })

          try {
            const value = Function(
              "Static",
              `return ${e.target.value}`
            )(Project.data.statics)
            setInputIsValid(can(selectedEvent, value))
            setInputError("")
          } catch (e) {
            setInputError(e.message)
            setInputIsValid(false)
          }
        }}
      ></Textarea>
      <Button
        variant="secondary"
        disabled={!inputIsValid}
        onClick={() => {
          const value = Function(
            "Static",
            `return ${payloads[selectedEvent]}`
          )(Project.data.statics)
          Project.data.captive.send(selectedEvent, value)
        }}
      >
        Send Event
        <PlayCircle
          data-hidey="true"
          size={14}
          strokeWidth={3}
          sx={{ ml: 2 }}
        />
      </Button>
      <Flex
        sx={{
          alignItems: "center",
          width: "100%",
          fontSize: 1,
          textAlign: "left",
          zIndex: 1,
        }}
      >
        {inputError && (
          <AlertOctagon
            size={14}
            sx={{
              color: "accent",
              mr: 2,
            }}
          />
        )}
        {inputError || ""}
      </Flex>
    </Grid>
  )
}

export default Payload
