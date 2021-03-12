// From biltong
// https://github.com/jsplumb/biltong

/**
 * Represents an x,y location.
 */
export type Point = {
  x: number
  y: number
}

/**
 * Represents an x,y location as an array.
 */
export type PointArray = [number, number]

/**
 * Represents a line consisting of two points
 */
export type Line = [Point, Point]

/**
 * Represents a rectangle, consisting of x,y and w,h.
 */
export type Rectangle = {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Represents the quadrant of the circle in which the angle between two points lies.
 */
export type Quadrant = 1 | 2 | 3 | 4

/**
 * Convenience type allowing various methods to take either an object or
 * an array representing a point.
 */
export type PointRepresentation = Point | PointArray

let _segmentMultipliers = [null, [1, -1], [1, 1], [-1, 1], [-1, -1]]
let _inverseSegmentMultipliers = [null, [-1, -1], [-1, 1], [1, 1], [1, -1]]

function pointHelper(
  p1: PointRepresentation,
  p2: PointRepresentation,
  fn: (p1: PointArray, p2: PointArray) => number
): number {
  let _p1 = Array.isArray(p1) ? p1 : [p1.x, p1.y]
  let _p2 = Array.isArray(p2) ? p2 : [p2.x, p2.y]

  return fn(<PointArray>_p1, <PointArray>_p2)
}

/**
 * @method Biltong.gradient
 * @desc Calculates the gradient of a line between the two points.
 * @param {Point} p1 First point, either as a 2 entry array or object with `left` and `top` properties.
 * @param {Point} p2 Second point, either as a 2 entry array or object with `left` and `top` properties.
 * @return {number} The gradient of a line between the two points.
 */
export function gradient(
  p1: PointRepresentation,
  p2: PointRepresentation
): number {
  return pointHelper(p1, p2, function (_p1: PointArray, _p2: PointArray) {
    if (_p2[0] === _p1[0]) return _p2[1] > _p1[1] ? Infinity : -Infinity
    else if (_p2[1] === _p1[1]) return _p2[0] > _p1[0] ? 0 : -0
    else return (_p2[1] - _p1[1]) / (_p2[0] - _p1[0])
  })
}

/**
 * @method Biltong.normal
 * @desc Calculates the gradient of a normal to a line between the two points.
 * @param {Point} p1 First point, either as a 2 entry array or object with `left` and `top` properties.
 * @param {Point} p2 Second point, either as a 2 entry array or object with `left` and `top` properties.
 * @return {number} The gradient of a normal to a line between the two points.
 */
export function normal(
  p1: PointRepresentation,
  p2: PointRepresentation
): number {
  return -1 / gradient(p1, p2)
}

/**
 * @method Biltong.lineLength
 * @desc Calculates the length of a line between the two points.
 * @param {Point} p1 First point, either as a 2 entry array or object with `left` and `top` properties.
 * @param {Point} p2 Second point, either as a 2 entry array or object with `left` and `top` properties.
 * @return {number} The length of a line between the two points.
 */
export function lineLength(
  p1: PointRepresentation,
  p2: PointRepresentation
): number {
  return pointHelper(p1, p2, (_p1: PointArray, _p2: PointArray) => {
    return Math.sqrt(
      Math.pow(_p2[1] - _p1[1], 2) + Math.pow(_p2[0] - _p1[0], 2)
    )
  })
}

/**
 * @method Biltong.quadrant
 * @desc Calculates the quadrant in which the angle between the two points lies.
 * @param {Point} p1 First point, either as a 2 entry array or object with `left` and `top` properties.
 * @param {Point} p2 Second point, either as a 2 entry array or object with `left` and `top` properties.
 * @return {Quadrant} The quadrant - 1 for upper right, 2 for lower right, 3 for lower left, 4 for upper left.
 */
export function quadrant(
  p1: PointRepresentation,
  p2: PointRepresentation
): Quadrant {
  return <Quadrant>pointHelper(p1, p2, (_p1: PointArray, _p2: PointArray) => {
    if (_p2[0] > _p1[0]) {
      return _p2[1] > _p1[1] ? 2 : 1
    } else if (_p2[0] === _p1[0]) {
      return _p2[1] > _p1[1] ? 2 : 1
    } else {
      return _p2[1] > _p1[1] ? 3 : 4
    }
  })
}

/**
 * @method Biltong.theta
 * @desc Calculates the angle between the two points.
 * @param {Point} p1 First point, either as a 2 entry array or object with `left` and `top` properties.
 * @param {Point} p2 Second point, either as a 2 entry array or object with `left` and `top` properties.
 * @return {number} The angle between the two points.
 */
export function theta(
  p1: PointRepresentation,
  p2: PointRepresentation
): number {
  return pointHelper(p1, p2, (_p1: PointArray, _p2: PointArray) => {
    let m = gradient(_p1, _p2),
      t = Math.atan(m),
      s = quadrant(_p1, _p2)

    if (s === 4 || s === 3) {
      t += Math.PI
    }
    if (t < 0) {
      t += 2 * Math.PI
    }

    return t
  })
}

/**
 * @method Biltong.intersects
 * @desc Calculates whether or not the two rectangles intersect.
 * @param {Rectangle} r1 First rectangle, as a js object in the form `{x:.., y:.., w:.., h:..}`
 * @param {Rectangle} r2 Second rectangle, as a js object in the form `{x:.., y:.., w:.., h:..}`
 * @return {Boolean} True if the rectangles intersect, false otherwise.
 */
export function intersects(r1: Rectangle, r2: Rectangle): boolean {
  let x1 = r1.x,
    x2 = r1.x + r1.w,
    y1 = r1.y,
    y2 = r1.y + r1.h,
    a1 = r2.x,
    a2 = r2.x + r2.w,
    b1 = r2.y,
    b2 = r2.y + r2.h

  return (
    (x1 <= a1 && a1 <= x2 && y1 <= b1 && b1 <= y2) ||
    (x1 <= a2 && a2 <= x2 && y1 <= b1 && b1 <= y2) ||
    (x1 <= a1 && a1 <= x2 && y1 <= b2 && b2 <= y2) ||
    (x1 <= a2 && a1 <= x2 && y1 <= b2 && b2 <= y2) ||
    (a1 <= x1 && x1 <= a2 && b1 <= y1 && y1 <= b2) ||
    (a1 <= x2 && x2 <= a2 && b1 <= y1 && y1 <= b2) ||
    (a1 <= x1 && x1 <= a2 && b1 <= y2 && y2 <= b2) ||
    (a1 <= x2 && x1 <= a2 && b1 <= y2 && y2 <= b2)
  )
}

/**
 * @method Biltong.encloses
 * @desc Calculates whether or not r2 is completely enclosed by r1.
 * @param {Rectangle} r1 First rectangle, as a js object in the form `{x:.., y:.., w:.., h:..}`
 * @param {Rectangle} r2 Second rectangle, as a js object in the form `{x:.., y:.., w:.., h:..}`
 * @param {Boolean} [allowSharedEdges=false] If true, the concept of enclosure allows for one or more edges to be shared by the two rectangles.
 * @return {Boolean} True if r1 encloses r2, false otherwise.
 */
export function encloses(
  r1: Rectangle,
  r2: Rectangle,
  allowSharedEdges?: boolean
): boolean {
  let x1 = r1.x,
    x2 = r1.x + r1.w,
    y1 = r1.y,
    y2 = r1.y + r1.h,
    a1 = r2.x,
    a2 = r2.x + r2.w,
    b1 = r2.y,
    b2 = r2.y + r2.h,
    c = (v1: number, v2: number, v3: number, v4: number) => {
      return allowSharedEdges ? v1 <= v2 && v3 >= v4 : v1 < v2 && v3 > v4
    }

  return c(x1, a1, x2, a2) && c(y1, b1, y2, b2)
}

/**
 * @method Biltong.pointOnLine
 * @desc Calculates a point on the line from `fromPoint` to `toPoint` that is `distance` units along the length of the line.
 * @param {Point} fromPoint First point, either as an object with `left` and `top` properties.
 * @param {Point} toPoint Second point, either as an object with `left` and `top` properties.
 * @param {number} distance The distance to travel along the line.
 * @return {Point} Point on the line, in the form `{ x:..., y:... }`.
 */
export function pointOnLine(
  fromPoint: Point,
  toPoint: Point,
  distance: number
): Point {
  let m = gradient(fromPoint, toPoint),
    s = quadrant(fromPoint, toPoint),
    segmentMultiplier =
      distance > 0 ? _segmentMultipliers[s] : _inverseSegmentMultipliers[s],
    theta = Math.atan(m),
    y = Math.abs(distance * Math.sin(theta)) * segmentMultiplier[1],
    x = Math.abs(distance * Math.cos(theta)) * segmentMultiplier[0]

  return { x: fromPoint.x + x, y: fromPoint.y + y }
}

/**
 * @method Biltong.perpendicularLineTo
 * @desc Calculates a line of length `length` that is perpendicular to the line from `fromPoint` to `toPoint` and passes through `toPoint`.
 * @param {Point} fromPoint First point, either as an object with `left` and `top` properties.
 * @param {Point} toPoint Second point, either as an object with `left` and `top` properties.
 * @param {number} length The length of the line to create.
 * @return {Line} Perpendicular line, in the form `[ { x:..., y:... }, { x:..., y:... } ]`.
 */
export function perpendicularLineTo(
  fromPoint: Point,
  toPoint: Point,
  length: number
): Line {
  let m = gradient(fromPoint, toPoint),
    theta2 = Math.atan(-1 / m),
    y = (length / 2) * Math.sin(theta2),
    x = (length / 2) * Math.cos(theta2)
  return [
    { x: toPoint.x + x, y: toPoint.y + y },
    { x: toPoint.x - x, y: toPoint.y - y },
  ]
}
