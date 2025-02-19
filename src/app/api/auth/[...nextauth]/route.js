import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { signInGoogle } from "../../../../../server_actions/actions/serverActions";
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.JWT_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
        try {
            const userData = await signInGoogle(user);
            return true;
        } catch (error) {
            console.error("Error storing user data:", error);
            return false;
        }
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/login`;
    },
    async session({ session, token, user }) {
      
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
        return token;
    },
  }
});

export { handler as GET, handler as POST };