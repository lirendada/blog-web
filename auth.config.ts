import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = nextUrl.pathname === '/admin/login'
      const isOnAdmin = nextUrl.pathname.startsWith('/admin') && !isOnLogin

      if (isOnLogin) {
        return true
      }
      if (isOnAdmin) {
        return isLoggedIn
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
