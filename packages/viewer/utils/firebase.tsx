import firebase from "firebase/app"
import "firebase/firestore"
import initFirebase from "../auth/initFirebase"
import Router from "next/router"

initFirebase()

const db = firebase.firestore()

export type ProjectInfo = {
  pid: string
  oid: string
  name: string
  code: string
  jsx: string
  theme: string
  statics: string
}

export type UserProjectsResponse = {
  uid: string
  oid: string
  projects: string[]
  isOwner: boolean
  isAuthenticated: boolean
  error?: Error
}

export type ProjectResponse = {
  uid: string
  oid: string
  pid: string
  isAuthenticated: boolean
  isProject: boolean
  isOwner: boolean
  error?: Error
}

export type AdminResponse = {
  projects: ProjectInfo[]
  isAuthenticated: boolean
  error?: Error
}

export async function getTemplate(pid: string) {
  const doc = await db.collection("templates").doc(pid).get()

  if (doc.exists) {
    return doc.data()
  } else {
    throw Error("Missing template! ID:" + pid)
  }
}

export async function getProjectData(
  pid: string,
  oid: string
): Promise<ProjectInfo> {
  const initial = await db
    .collection("users")
    .doc(oid)
    .collection("projects")
    .doc(pid)
    .get()

  if (initial.exists) {
    const data = initial.data()
    return { ...data, pid, oid: data.owner } as ProjectInfo
  } else {
    return undefined
  }
}

export function getProject(pid: string, oid: string) {
  return db.collection("users").doc(oid).collection("projects").doc(pid)
}

export async function addUser(uid: string) {
  const user = db.collection("users").doc(uid)
  const initial = await user.get()

  if (initial.exists) {
    user.update({ exists: true }).catch((e) => {
      console.log("Error setting user", uid, e.message)
    })
  } else {
    user.set({ exists: true }).catch((e) => {
      console.log("Error setting user", uid, e.message)
    })
  }
}

export async function addProject(
  pid: string,
  oid: string,
  template: { [key: string]: any }
) {
  const project = getProject(pid, oid)
  const initial = await project.get()

  if (initial.exists) {
    console.log("That project already exists!")
    return project
  }

  // Overwrite the template's name and owner
  return project.set({
    ...template,
    name: pid,
    owner: oid,
  })
}

export function updateProject(
  pid: string,
  oid: string,
  changes: { [key: string]: any }
) {
  return getProject(pid, oid).update({
    ...changes,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  })
}

export async function createProject(
  pid: string,
  uid: string,
  templateId = "toggle"
) {
  const template = await db.collection("templates").doc(templateId).get()
  return await addProject(pid, uid, template.data())
}

export async function updateProjectJsx(
  pid: string,
  oid: string,
  uid: string,
  code: string
) {
  // must be owner
  if (uid === oid) {
    return updateProject(pid, oid, {
      jsx: JSON.stringify(code),
    })
  }
}

export async function updateProjectCode(
  pid: string,
  oid: string,
  uid: string,
  code: string
) {
  // must be owner
  if (uid === oid) {
    return updateProject(pid, oid, {
      code: JSON.stringify(code),
    })
  }
}

export function subscribeToDocSnapshot(
  pid: string,
  oid: string,
  callback: (
    doc: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  ) => void
) {
  let unsub: any

  getProject(pid, oid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No project with that owner / id!")
      }

      unsub = db
        .collection("users")
        .doc(oid)
        .collection("projects")
        .doc(pid)
        .onSnapshot((doc) => {
          if (!doc.exists) {
            return
          }
          callback(doc)
        })
    })

  return () => unsub && unsub()
}

export async function createNewProject(pid: string, oid: string, uid: string) {
  await createProject(pid, uid, "toggle")
  Router.push(`/${uid}/${pid}`)
}

export async function forkProject(
  pid: string,
  oid: string,
  uid: string,
  nextpid?: string
) {
  const project = await getProject(pid, oid).get()

  if (!project.exists) {
    console.log("That project doesn't exist!")
    return
  }

  const data = project.data()

  const doc = db
    .collection("users")
    .doc(uid)
    .collection("projects")
    .doc(nextpid ? nextpid : pid)

  const initial = await doc.get()

  if (initial.exists) {
    // Not sure
    console.log("Project already exists!")
  } else {
    await doc.set({
      ...data,
      owner: uid,
    })
  }

  Router.push(`/${uid}/${nextpid ? nextpid : pid}`)
}

export async function getProjectInfo(pid: string, oid: string, uid: string) {
  const project = await getProject(pid, oid).get()

  return {
    isProject: project.exists,
    isOwner: oid === uid,
  }
}

export async function getUserProjects(uid: string) {
  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("projects")
    .get()

  const projects = snapshot.docs.map((doc) => doc.id)

  return {
    projects,
  }
}

export async function getUserProjectById(uid: string, pid: string) {
  const project = await db
    .collection("users")
    .doc(uid)
    .collection("projects")
    .doc(pid)
    .get()

  return project
}

export async function isProjectNameValid(
  pid: string,
  uid: string,
  name: string
) {
  return true
}

export async function updateProjectName(
  pid: string,
  uid: string,
  name: string
) {
  updateProject(pid, uid, { name })
}

// Admin

export async function getAdminData() {
  const projects = db.collectionGroup("projects")
  const ip = await projects.get()
  const idsp = ip.docs.map((doc) => {
    const data = doc.data()
    return { oid: data.owner, pid: doc.id, ...doc.data() } as ProjectInfo
  })

  return idsp
}
