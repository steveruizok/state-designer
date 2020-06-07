import React from "react"
import { Dogs as D } from "components"
import { delay } from "utils"
import { useStateDesigner } from "@state-designer/react"

export default function () {
  const state = useStateDesigner({
    data: {
      image: "",
      count: 0,
    },
    initial: "ready",
    states: {
      ready: {
        on: {
          FETCHED_IMAGE: { to: "loading" },
        },
      },
      loading: {
        on: {
          CANCELLED_FETCH: { to: "ready" },
        },
        async: {
          await: "fetchDogImage",
          onResolve: {
            do: "setImage",
            to: "success",
          },
          onReject: {
            to: "error",
          },
        },
        onEnter: {
          to: "ready",
          do: () => console.log("times up!"),
          wait: "maxLoadingTime",
        },
      },
      error: {
        on: { FETCHED_IMAGE: { to: "loading" } },
      },
      success: {
        on: { FETCHED_IMAGE: { to: "loading" } },
      },
    },
    actions: {
      setImage(data, payload, result) {
        data.image = result
      },
    },
    asyncs: {
      fetchDogImage: async () => {
        const res = await fetch("https://dog.ceo/api/breeds/image/random")
        const json = await res.json()
        await delay(2000) // Fake 3 second delay
        return json.message
      },
    },
    times: {
      maxLoadingTime: 5,
    },
  })

  return (
    <D.Layout>
      <D.Image image={state.data.image} />
      <D.Button
        isLoading={state.isIn("loading")}
        onClick={() => state.send("FETCHED_IMAGE")}
      >
        {state.whenIn({
          ready: "Fetch",
          success: "Fetch Again",
          error: "Try Again",
          loading: "Loading...",
        })}
      </D.Button>
      <D.Button
        disabled={!state.isIn("loading")}
        onClick={() => state.send("CANCELLED_FETCH")}
      >
        Cancel
      </D.Button>
    </D.Layout>
  )
}
