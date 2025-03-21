"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from '@/utils/supabase/client'
import { Spinner } from "@/components/spinner";

const supabase = createClient()

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    getSession()
    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="default" />
      </div>
    )
  }

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="h-full flex">
      <Navigation user={user} />
      <main className="flex-1 h-full overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}

export default MainLayout