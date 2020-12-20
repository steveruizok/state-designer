// App

export type LayoutOffset = "content" | "main" | "code" | "detail" | "console"

// Data

export interface User {
  name: string
  uid: string
  email: string
  picture: string
  authenticated: boolean
}

export interface AuthState {
  user: User | null
  error: string
  authenticated: boolean
}

export type ProjectResponse = {
  oid: string
  pid: string
  isProject: boolean
  isOwner: boolean
}

export type ProjectData = {
  pid: string
  oid: string
  name: string
  code: string
  jsx: string
  theme: string
  statics: string
  tests: string
}

export type AdminResponse = {
  projects: ProjectData[]
  authenticated: boolean
  error?: Error
}

export type UserProjectsResponse = {
  oid: string
  projects: string[]
  isOwner: boolean
}
