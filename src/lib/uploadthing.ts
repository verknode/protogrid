import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "./auth";
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  requestAttachment: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    pdf:   { maxFileSize: "16MB", maxFileCount: 3 },
    blob:  { maxFileSize: "32MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      // Return value becomes serverData on the client, but we don't need it
      // since ClientUploadedFileData already exposes url/key/name/size/type.
      return { ok: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
