// store/useAuthStore.js
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useAuthStore = create((set) => ({
  token: null,
  userEmail: null,    // ← email is the ID
  user: null,

  saveAuth: async (token, user) => {
    await AsyncStorage.setItem('token', token)
    await AsyncStorage.setItem('userEmail', user.email)  // ← store email
    await AsyncStorage.setItem('user', JSON.stringify(user))
    set({ token, userEmail: user.email, user })
  },

  loadAuth: async () => {
    const token = await AsyncStorage.getItem('token')
    const userEmail = await AsyncStorage.getItem('userEmail')
    const userStr = await AsyncStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    set({ token, userEmail, user })
    return { token, userEmail }   // ← return email instead of _id
  },

  clearAuth: async () => {
    await AsyncStorage.multiRemove(['token', 'userEmail', 'user'])
    set({ token: null, userEmail: null, user: null })
  },
}))

export default useAuthStore