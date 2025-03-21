"use client";

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronsLeftRight } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export const Navigation = ({ user }: { user: User }) => {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <aside className="group/sidebar h-full bg-secondary overflow-y-auto relative flex flex-col z-[99999]">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-x-2">
          <ChevronsLeftRight className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-sm">
            {user.email}'s Journals
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1 px-2">
        <Link
          href="/journals"
          className="text-sm px-3 py-2 rounded-md hover:bg-accent transition-colors"
        >
          My Journals
        </Link>
        <Link
          href="/journals/new"
          className="text-sm px-3 py-2 rounded-md hover:bg-accent transition-colors"
        >
          New Entry
        </Link>
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={handleSignOut}
          className="text-sm w-full text-left px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive"
        >
          Sign Out
        </button>
        <div className="flex items-center gap-x-2">
  <ChevronsLeftRight className="w-5 h-5 text-muted-foreground" />
  <span className="font-semibold text-sm">
    {user?.email} {/* This should already show email */}
  </span>
  <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse" />
</div>
      </div>
    </aside>
  )
}