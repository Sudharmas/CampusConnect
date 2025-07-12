import { cn } from "@/lib/utils";

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div style={{ perspective: "1000px" }}>
        <div className="relative w-16 h-16 animate-spin-3d" style={{ transformStyle: "preserve-3d" }}>
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            style={{ position: "absolute", top: 0, left: 0, transform: "rotateY(0deg) translateZ(28.87px)" }}
          >
            <polygon points="50,0 100,86.6 0,86.6" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
          </svg>
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            style={{ position: "absolute", top: 0, left: 0, transform: "rotateY(120deg) translateZ(28.87px)" }}
          >
            <polygon points="50,0 100,86.6 0,86.6" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
          </svg>
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            style={{ position: "absolute", top: 0, left: 0, transform: "rotateY(240deg) translateZ(28.87px)" }}
          >
            <polygon points="50,0 100,86.6 0,86.6" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
          </svg>
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            style={{ position: "absolute", top: 0, left: 0, transform: "rotateX(70.53deg) rotateY(180deg) translateZ(40.82px)" }}
          >
            <polygon points="50,0 100,86.6 0,86.6" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="text-primary text-glow font-headline">Connecting...</p>
    </div>
  );
};

export default LoadingSpinner;
