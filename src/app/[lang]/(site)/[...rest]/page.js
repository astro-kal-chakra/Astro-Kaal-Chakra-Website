import { redirect } from "next/navigation";

/** Any address that matches no page (typos, old links, random text) goes straight to the home page. */
export default function CatchAll() {
  redirect("/");
}
