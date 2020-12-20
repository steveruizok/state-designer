import db from "./firestore"
import firebase from "./firebase"
import router from "next/router"
import * as Types from "types"

export async function getProjectInfo(
  pid: string,
  oid: string,
  uid?: string
): Promise<Types.ProjectResponse> {
  const project = await db
    .collection("users")
    .doc(oid)
    .collection("projects")
    .doc(pid)
    .get()

  return {
    oid,
    pid,
    isProject: project.exists,
    isOwner: oid === uid,
  }
}

export async function getProjectData(
  pid: string,
  oid: string
): Promise<Types.ProjectData> {
  const initial = await db
    .collection("users")
    .doc(oid)
    .collection("projects")
    .doc(pid)
    .get()

  if (initial.exists) {
    const data = initial.data()
    return { ...data, pid, oid: data.owner } as Types.ProjectData
  } else {
    return undefined
  }
}

export async function getTemplate(pid: string) {
  const doc = await db.collection("templates").doc(pid).get()

  if (doc.exists) {
    return doc.data()
  } else {
    throw Error("Missing template! ID:" + pid)
  }
}

export function getProject(pid: string, oid: string) {
  return db.collection("users").doc(oid).collection("projects").doc(pid)
}

// This is mostly a stupid fix to prevent "ghost entries" for
// users. We need to define some property on the user doc in order
// to fetch a list of existing users in admin. So if the user
// is new, create an entry with `exists: true`, otherwise add
// that entry (if missing) to the user's doc.
export async function addUser(uid: string) {
  const user = db.collection("users").doc(uid)
  const initial = await user.get()

  if (initial.exists) {
    if (!initial.data().exists) {
      user.update({ exists: true }).catch((e) => {
        console.log("Error setting user", uid, e.message)
      })
    }
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
  router.push(`/${uid}/${pid}`)
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

  router.push(`/${uid}/${nextpid ? nextpid : pid}`)
}

export async function getUserProjects(uid: string, oid: string) {
  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("projects")
    .get()

  const projects = snapshot.docs.map((doc) => doc.id)

  return {
    uid,
    oid,
    projects,
    isOwner: uid === oid,
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
