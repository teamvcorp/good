import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
