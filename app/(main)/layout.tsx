import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase/auth.config';

"use client";


import { redirect } from "next/navigation";

// import { Spinner } from "@/components/spinner";
// import { SearchCommand } from "@/components/search-command";

// import { Navigation } from "./_components/navigation";



const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
  
      return () => authListener?.subscription.unsubscribe();
    }, []);
  
    if (loading) {
      return <div className="flex h-full items-center justify-center"><Spinner size="md" /></div>;
    }
  
    if (!user) {
      return router.push('/');
    }

//   return ( 
//     <div className="h-full flex dark:bg-[#1F1F1F]">
//       <Navigation />
//       <main className="flex-1 h-full overflow-y-auto">
//       <SearchCommand />
//         {children}
//       </main>
//     </div>
//    );
}
 
export default MainLayout;