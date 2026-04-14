import { redirect } from "next/navigation";

// This route group is superseded by /admin — redirect any stale hits
export default function OldAdminLayout() {
  redirect("/admin/dashboard");
}
