
import Link from "next/link";
import AnimatedBackground from "@/components/ui/animated-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-transparent">
      <AnimatedBackground variant="login" />
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary text-glow"
          >
            <path d="M10.19 1.44a1 1 0 0 0-1.02.06l-4.5 3.22a1 1 0 0 0-.47.85v12.86a1 1 0 0 0 .47.85l4.5 3.22a1 1 0 0 0 1.02.06l11-7.86a1 1 0 0 0 0-1.8l-11-7.86Z" />
            <path d="m11 13-6 4.29" />
            <path d="m11 13-6-4.29" />
            <path d="M11 13v9" />
            <path d="M11 13 22 5" />
          </svg>
          <span className="ml-2 text-lg font-bold font-headline text-glow">CampusConnect</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
