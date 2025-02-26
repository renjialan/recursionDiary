import Image from "next/image";

export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl">
      <div className="flex items-center">
        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
          <Image
            src="/yoga.png"
            fill
            className="object-contain dark:hidden"
            alt="Illustration of a yoga pose"
          />
          <Image
            src="/yoga.png"
            fill
            className="object-contain hidden dark:block rounded-xl"
            alt="Documents"
          />
        </div>
        <div className="relative h-[400px] w-[400px] hidden md:block ">
          <Image
            src="/grow.png"
            fill
            className="object-contain dark:hidden"
            alt="Reading"
          />
          <Image
            src="/grow.png"
            fill
            className="object-contain hidden dark:block rounded-xl"
            alt="Reading"
          />
        </div>
      </div>
    </div>
  )
}