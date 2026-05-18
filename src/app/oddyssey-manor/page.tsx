import { redirect } from "next/navigation";

// The wireframe home moved to /oddyssey. Internal admin tools are still
// reachable at /oddyssey-manor/admin (linked from the new home's footer).
export default function OddysseyManorRedirect() {
  redirect("/oddyssey");
}
