"use client";

// import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
// import { SignInButton } from "@clerk/clerk-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Spinner } from "@/components/spinner";


export const Heading = () => {
//   const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
      Your Thoughts, Layers, & Revelations. Reflected. Welcome to <span className="underline">Loop Journal</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
      Loop Journal is the introspective diary where <br />
      thoughts unpack their own depth.
      </h3>
      <Button>
        Start Reflecting
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
      
      {/* {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/documents">
            Enter Jotion
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )} */}
      {/* {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button>
            Get Jotion free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )} */}
    </div>
  )
}