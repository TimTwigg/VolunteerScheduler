import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { NextAuthOptions as NextAuthConfig, Session } from "next-auth"
import { getServerSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@next-auth/firebase-adapter"

export const config = {
    adapter: FirestoreAdapter(),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
            checks: "none",
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/drive"
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, account }) {
            token.userRole = "admin"
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            session.token = token.accessToken
            session.sheetID = process.env.GOOGLE_SHEET_ID
            return session
        },
        async redirect({ baseUrl }) {
            return baseUrl
        }
    }
} satisfies NextAuthConfig

export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
    return getServerSession(...args, config)
}

declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            NEXTAUTH_SECRET: string
            GOOGLE_ID: string
            GOOGLE_SECRET: string
        }
    }
}