import * as React from 'react'

export default function({ name, number }) {
  let path = number ? `${number}_${name}` : name

  return (
    <iframe
      src={`https://codesandbox.io/embed/github/steveruizok/state-designer/tree/master/archive/tutorials?autoresize=1&fontsize=14&hidenavigation=1&initialpath=%2F${name}-complete&module=%2Fsrc%2Ftutorials%2F${path}%2Fcomplete%2Findex.js&theme=light`}
      style={{
        width: '100%',
        height: 'min(75vh,800px)',
        border: 0,
        borderRadius: 4,
        overflow: 'hidden',
      }}
      title="steveruizok/state-designer: tutorials"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    ></iframe>
  )
}
