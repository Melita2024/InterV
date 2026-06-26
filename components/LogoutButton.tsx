"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth.action";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Logged out. Redirecting...");
      router.push("/sign-in");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2 text-light-400 hover:text-destructive-100 transition-colors cursor-pointer text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <LogOut size={18} className={isLoggingOut ? "animate-pulse" : undefined} />
      <span className="max-sm:hidden">
        {isLoggingOut ? "Logging out..." : "Logout"}
      </span>
    </button>
  );
};

export default LogoutButton;
