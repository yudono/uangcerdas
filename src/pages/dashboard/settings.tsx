import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/src/components/Dashboard";

export default function DashboardSettingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <DashboardLayout>
      <div></div>
    </DashboardLayout>
  );
}
