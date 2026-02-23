import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@vendor-management/database"
import bcrypt from "bcryptjs"
import { loginSchema } from "@vendor-management/shared"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const validated = loginSchema.safeParse(credentials)
          if (!validated.success) {
            throw new Error("Invalid credentials format")
          }

          const { email, password } = validated.data

          const user = await prisma.user.findUnique({
            where: { email, deletedAt: null },
            include: { company: true }
          })

          if (!user || !user.password) {
            throw new Error("Invalid credentials")
          }

          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) {
            throw new Error("Invalid credentials")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            companyId: user.companyId,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.companyId = user.companyId
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.companyId = token.companyId as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}
