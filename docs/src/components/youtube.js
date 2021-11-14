import * as React from "react"

export default function ({ id }) {
  return (
    <div
      style={{
        width: "100%",
        height: 0,
        paddingBottom: "56.25%",
        position: "relative",
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}
