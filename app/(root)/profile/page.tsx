import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <ProfileForm user={user} />;
}
