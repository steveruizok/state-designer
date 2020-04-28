export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export enum SlotId {
  Head = "head",
  Body = "body",
  LeftHand = "left-hand",
  RightHand = "right-hand",
}

export enum ThingId {
  Hat = "hat",
  Hoodie = "hoodie",
  Knife = "knife",
  Hatchet = "hatchet",
  FishingRod = "fishing-rod",
  TShirt = "t-shirt",
  Binoculars = "binoculars",
  FishingVest = "fishing-vest",
  Compass = "compass",
  SwissArmyKnife = "swiss-army-knife",
}

export interface Thing {
  id: ThingId
  name: string
  size: Size
  slots: SlotId[]
  image: string
}

export type Things = Record<ThingId, Thing>

export interface Slot {
  id: SlotId
  name: string
  point: Point
  size: Size
  item: string | undefined
}

export type Slots = Record<SlotId, Slot>

export interface Item {
  id: string
  point: Point
  thing: ThingId
  rotation: number
  slot: SlotId | undefined
}

export type InventoryGrid = string[][]

export type Data = {
  slots: Slots
  things: Things
  equipped: string[]
  inventory: {
    dragging: Item | undefined
    contents: Record<string, Item>
    cells: InventoryGrid
  }
}
