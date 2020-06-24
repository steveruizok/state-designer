import * as React from "react"
import firebase from "firebase"

const db = firebase.firestore()

export function useFirebaseCode(id: string) {
  const doc = React.useMemo(() => db.collection("projects").doc(id), [id])

  const [state, setState] = React.useState<string | null>(null)

  React.useEffect(() => {
    doc.onSnapshot((doc) => {
      setState(doc.data().code)
    })
  }, [id])

  const update = React.useCallback(
    (code: string) =>
      doc.update({
        code: JSON.stringify(code),
      }),
    []
  )

  return [state, update] as const
}
