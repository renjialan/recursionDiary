"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import supabase from "@/supabase/auth.config";
import { Spinner } from "@/components/spinner";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => authListener?.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="default" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null; // Add explicit return for this case
  }

  return (
    <div className="h-full flex dark:bg-[1F1F1F]">
      {/* Uncomment when ready */}
      {/* <Navigation /> */}
      <main className="flex-1 h-full overflow-y-auto">
        {/* <SearchCommand /> */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;