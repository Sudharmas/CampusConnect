import { cn } from "@/lib/utils";

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative w-24 h-24", className)}>
        <div className="loader-container">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
  );
};

export default LoadingSpinner;
