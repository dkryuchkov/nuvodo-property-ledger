import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const AUTH_BASE_PATH = "/api/auth";
const GOOGLE_AUTH_PROMPT = "select_account consent";

function normalizeUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    const path = url.pathname.replace(/\/+$/, "");

    return `${url.origin}${path === "/" ? "" : path}`;
  } catch (error) {
    console.warn("Ignoring invalid Auth.js URL environment value", {
      value: trimmed,
      error,
    });
    return undefined;
  }
}

function toAuthBaseUrl(value: string | undefined): string | undefined {
  const normalizedUrl = normalizeUrl(value);

  if (!normalizedUrl) {
    return undefined;
  }

  return normalizedUrl.endsWith(AUTH_BASE_PATH)
    ? normalizedUrl
    : `${normalizedUrl}${AUTH_BASE_PATH}`;
}

function getRedirectProxyUrl(): string | undefined {
  return (
    toAuthBaseUrl(process.env.AUTH_REDIRECT_PROXY_URL) ??
    toAuthBaseUrl(process.env.AUTH_URL) ??
    toAuthBaseUrl(process.env.NEXTAUTH_URL) ??
    toAuthBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    toAuthBaseUrl(process.env.URL)
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  redirectProxyUrl: getRedirectProxyUrl(),
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/datastore",
          access_type: "offline",
          prompt: GOOGLE_AUTH_PROMPT,
          include_granted_scopes: "true",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
