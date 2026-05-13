import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      userId: null,
      email: null,
      role: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (auth) => {
        localStorage.setItem('accessToken', auth.accessToken)
        localStorage.setItem('refreshToken', auth.refreshToken)
        set({
          userId: auth.userId,
          email: auth.email,
          role: auth.role,
          accessToken: auth.accessToken,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ userId: null, email: null, role: null, accessToken: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-storage' }
  )
)
