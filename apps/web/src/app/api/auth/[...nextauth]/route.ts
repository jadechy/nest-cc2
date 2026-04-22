import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",

            credentials: {
                otp: { label: "Code", type: "string" },
                email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(credentials),
                    },
                );
                if (!res.ok) return null;
                const data = await res.json();
                return {
                    id: data.user.id,
                    email: data.user.email,
                    username: data.user.username,
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.id = Number(user.id);
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                accessToken: token.accessToken,
                user: {
                ...session.user,
                id: token.id,
                },
            };
        },
    },
    session: { strategy: "jwt" },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };