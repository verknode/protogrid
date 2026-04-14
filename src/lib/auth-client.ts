import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "./auth";

// inferAdditionalFields makes `role` and other server-side additionalFields
// available in useSession() types on the client.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
