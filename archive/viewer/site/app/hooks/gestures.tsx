// @jsx jsx
import * as React from "react"
import { useGesture } from "react-use-gesture"
import { useMotionValue, MotionValue } from "framer-motion"

export function usePreventZooming(
  rContainer: React.MutableRefObject<HTMLDivElement>
) {
  // Disable pinch-to-zoom on an element.
  React.useEffect(() => {
    const container = rContainer.current
    if (!container) return

    function preventTouchZooming(e: WheelEvent) {
      if (e.ctrlKey) e.preventDefault()
    }

    container.addEventListener("wheel", preventTouchZooming, {
      passive: false,
    })
    container.addEventListener("touchmove", preventTouchZooming, {
      passive: false,
    })
    return () => {
      container.removeEventListener("wheel", preventTouchZooming)
      container.removeEventListener("touchmove", preventTouchZooming)
    }
  }, [])

  return rContainer
}

export function useScaleZooming(
  wheel: boolean = true,
  pinch: boolean = true,
  minZoom: number = 0.25,
  maxZoom: number = 2.5,
  mvScale?: MotionValue<number>
) {
  const localMvScale = useMotionValue(0)

  const bind = useGesture({
    onPinch: ({ delta }) => {
      const mv = mvScale || localMvScale
      const scale = mv.get()
      pinch &&
        mv.set(Math.max(minZoom, Math.min(maxZoom, scale - delta[1] / 60)))
    },
    onWheel: ({ vxvy: [, vy] }) => {
      const mv = mvScale || localMvScale
      const scale = mv.get()
      wheel && mv.set(Math.max(minZoom, Math.min(maxZoom, scale + vy / 30)))
    },
  })

  return [bind, mvScale || localMvScale] as const
}
