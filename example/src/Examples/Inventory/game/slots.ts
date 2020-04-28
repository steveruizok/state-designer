import * as DS from "./types"

const slots: DS.Slots = {
  [DS.SlotId.Head]: {
    id: DS.SlotId.Head,
    name: "Head",
    point: { x: 7, y: 2 },
    size: { height: 4, width: 4 },
    item: undefined,
  },
  [DS.SlotId.Body]: {
    id: DS.SlotId.Body,
    name: "Body",
    point: { x: 6, y: 7 },
    size: { height: 6, width: 6 },
    item: undefined,
  },
  [DS.SlotId.LeftHand]: {
    id: DS.SlotId.LeftHand,
    name: "Left Hand",
    point: { x: 2, y: 11 },
    size: { height: 3, width: 3 },
    item: undefined,
  },
  [DS.SlotId.RightHand]: {
    id: DS.SlotId.RightHand,
    name: "Right Hand",
    point: { x: 13, y: 11 },
    size: { height: 3, width: 3 },
    item: undefined,
  },
}

export default slots
