import { createAuthClient } from "better-auth/react";

// No explicit baseURL — uses same origin as the current page.
// This avoids localhost vs 127.0.0.1 CORS mismatches in local dev.
export const authClient = createAuthClient();

export const { signIn, signOut, signUp, useSession } = authClient;
