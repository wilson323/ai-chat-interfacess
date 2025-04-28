import { redirect } from "next/navigation";

export default function UserHomePage() {
  redirect("/user/chat");
  return null;
} 