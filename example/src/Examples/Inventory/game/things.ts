import * as DS from "./types"
import * as Images from "../images"

const things: DS.Things = {
  [DS.ThingId.TShirt]: {
    id: DS.ThingId.TShirt,
    name: "T-Shirt",
    image: Images.TShirt,
    slots: [DS.SlotId.Body],
    size: {
      height: 6,
      width: 6,
    },
  },
  [DS.ThingId.Hoodie]: {
    id: DS.ThingId.Hoodie,
    name: "Hoodie",
    image: Images.Hoodie,
    slots: [DS.SlotId.Body],
    size: {
      height: 6,
      width: 6,
    },
  },
  [DS.ThingId.Knife]: {
    id: DS.ThingId.Knife,
    name: "Knife",
    image: Images.Knife,
    slots: [DS.SlotId.LeftHand, DS.SlotId.RightHand],
    size: {
      height: 4,
      width: 4,
    },
  },
  [DS.ThingId.Binoculars]: {
    id: DS.ThingId.Binoculars,
    name: "Knife",
    image: Images.Binoculars,
    slots: [DS.SlotId.LeftHand, DS.SlotId.RightHand],
    size: {
      height: 3,
      width: 3,
    },
  },
  [DS.ThingId.Hatchet]: {
    id: DS.ThingId.Hatchet,
    name: "Hatchet",
    image: Images.Hatchet,
    slots: [DS.SlotId.LeftHand, DS.SlotId.RightHand],
    size: {
      height: 4,
      width: 3,
    },
  },
  [DS.ThingId.FishingVest]: {
    id: DS.ThingId.FishingVest,
    name: "Fishing Vest",
    image: Images.FishingVest,
    slots: [DS.SlotId.Body],
    size: {
      height: 6,
      width: 6,
    },
  },
  [DS.ThingId.FishingRod]: {
    id: DS.ThingId.FishingRod,
    name: "Fishing Rod",
    image: Images.FishingRod,
    slots: [DS.SlotId.LeftHand, DS.SlotId.RightHand],
    size: {
      height: 5,
      width: 2,
    },
  },
  [DS.ThingId.Hat]: {
    id: DS.ThingId.Hat,
    name: "Hat",
    image: Images.Hat,
    slots: [DS.SlotId.Head],
    size: {
      height: 4,
      width: 4,
    },
  },
  [DS.ThingId.Compass]: {
    id: DS.ThingId.Compass,
    name: "Compass",
    image: Images.Compass,
    slots: [DS.SlotId.LeftHand, DS.SlotId.RightHand],
    size: {
      height: 2,
      width: 2,
    },
  },
  [DS.ThingId.SwissArmyKnife]: {
    id: DS.ThingId.SwissArmyKnife,
    name: "Swiss Army Knife",
    image: Images.SwissArmyKnife,
    slots: [DS.SlotId.LeftHand, DS.SlotId.RightHand],
    size: {
      height: 2,
      width: 3,
    },
  },
}

export default things
