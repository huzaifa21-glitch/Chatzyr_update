export const isMod = (user: { email: any }, mods: string | any[]) => {
  if (!user?.email || !mods) return false
  return mods.includes(user.email)
}