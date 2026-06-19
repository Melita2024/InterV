"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth.action";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-light-400 hover:text-destructive-100 transition-colors cursor-pointer text-sm font-medium"
    >
      <LogOut size={18} />
      <span className="max-sm:hidden">Logout</span>
    </button>
  );
};

export default LogoutButton;
