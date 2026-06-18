import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">Inter-V</h2>
        </Link>

        <Link href="/profile" className="relative group">
          <Image
            src={user?.profilePhoto || "/user-avatar.png"}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full object-cover size-[40px] border-2 border-primary-200/50 hover:border-primary-200 transition-colors"
          />
        </Link>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
