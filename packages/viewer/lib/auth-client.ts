// /lib/auth-client.ts

import router from "next/router"
import firebase from "./firebase"

async function clearUserToken() {
  var path = "/api/logout"
  var url = process.env.NEXT_PUBLIC_BASE_API_URL + path
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
}

async function postUserToken(token: string) {
  var path = "/api/login"
  var url = process.env.NEXT_PUBLIC_BASE_API_URL + path
  var data = { token }
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
}

// API

export async function login() {
  const provider = new firebase.auth.GoogleAuthProvider()
  const auth = await firebase.auth().signInWithPopup(provider)
  const token = await auth.user.getIdToken()

  await postUserToken(token)
  await firebase.auth().signOut()
  router.reload()
}

export async function logout() {
  await firebase.auth().signOut()
  await clearUserToken()
  router.reload()
}
