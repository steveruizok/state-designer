export async function mapUserData(
  user: any
): Promise<{
  id: string
  email: string
  token: string
}> {
  const { uid, email } = user
  const token = await user.getIdToken(true)
  return {
    id: uid,
    email,
    token,
  }
}
