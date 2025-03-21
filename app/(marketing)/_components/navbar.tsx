"use client";

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Logo } from './logo'
import { useScrollTop } from '@/hooks/use-scroll-top'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'

export const Navbar = () => {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const scrolled = useScrollTop()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    checkAuth()
    return () => subscription?.unsubscribe()
  }, [])


  return (
    <div className={cn(
      "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
      scrolled && "border-b shadow-sm"
    )}>
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {!user && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  )
}