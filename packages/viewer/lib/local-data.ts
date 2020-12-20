import { LayoutOffset } from "types"

export const panelOffsets = {
  content: 0,
  main: 0,
  code: 0,
  detail: 0,
  console: 0,
}

// Update offets from local storage
function loadLocalOffsets() {
  if (typeof window !== "undefined") {
    const savedOffsets = window.localStorage.getItem(`sd_panel_offsets`)
    if (savedOffsets !== null) {
      Object.assign(panelOffsets, JSON.parse(savedOffsets))
    }
  }
}

// Update CSS variables with local storage offsets
function updateCssVariables() {
  for (let key in panelOffsets) {
    document.documentElement.style.setProperty(
      `--${key}-offset`,
      panelOffsets[key] + "px"
    )
  }
}

// Save current offsets to local storage
function saveOffsets() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      `sd_panel_offsets`,
      JSON.stringify(panelOffsets)
    )
  }
}

// Set a panel offset
export function setPanelOffset(offset: LayoutOffset, value: number) {
  panelOffsets[offset] = value
  updateCssVariables()
  saveOffsets()
}

export function setupOffsets() {
  loadLocalOffsets()
  updateCssVariables()
}
