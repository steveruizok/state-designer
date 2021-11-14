import * as React from "react"

export default function () {
  React.useEffect(() => {
    function handleKeydown(event) {
      switch (event.key) {
        // Key Cases
        default:
          break
      }
    }

    function handleKeyup(event) {
      switch (event.key) {
        // Key Cases
        default:
          break
      }
    }

    document.body.addEventListener("keydown", handleKeydown)
    document.body.addEventListener("keyup", handleKeyup)
    return () => {
      document.body.removeEventListener("keydown", handleKeydown)
      document.body.removeEventListener("keyup", handleKeyup)
    }
  }, [])
}
