import { redirect } from "next/navigation";

// The wireframe experience consolidated to /oddyssey. Keep this route
// as a redirect so anyone bookmarked here still lands in the right place.
export default function WireframesRedirect() {
  redirect("/oddyssey");
}
