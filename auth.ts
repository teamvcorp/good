import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByUsername } from '@/lib/userStore';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const username = String(credentials.username).toLowerCase().trim();
        const user = await getUserByUsername(username);
        if (!user) return null;
        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.username };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.username = user.name;
      return token;
    },
    async session({ session, token }) {
      if (token.username) session.user.username = token.username as string;
      return session;
    },
  },
  pages: { signIn: '/login' },
});
