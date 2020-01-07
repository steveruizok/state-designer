export function uniqueId() {
  const initial = localStorage.getItem("DS_Id")
  if (initial === null) {
    localStorage.setItem("DS_Id", "1")
    return "1"
  }

  const id = (JSON.parse(initial) + 1).toString()
  localStorage.setItem("DS_Id", id)
  return id
}

export function getLocalSavedData(key: string, backup: any) {
  const savedData = localStorage.getItem(key)

  if (savedData !== null) {
    return JSON.parse(savedData)
  } else {
    return backup
  }
}

export function clearLocalStorage() {
  localStorage.removeItem("DS_Id")
  localStorage.removeItem("DS_States")
  localStorage.removeItem("DS_Handlers")
  localStorage.removeItem("DS_Events")
  localStorage.removeItem("DS_Actions")
  localStorage.removeItem("DS_Conditions")
  localStorage.removeItem("DS_Results")
  localStorage.removeItem("DS_UnsafeData")
  localStorage.removeItem("DS_SafeData")
  localStorage.removeItem("DS_CodeErr")
}
