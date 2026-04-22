import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: number;
      email: string;
      username?: string;
    };
  }

  interface User {
    id: number;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    id: number;
  }
}