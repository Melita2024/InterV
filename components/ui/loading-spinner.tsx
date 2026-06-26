import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const LoadingSpinner = ({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-24 text-light-400",
        className
      )}
    >
      <Loader2 className="size-8 animate-spin text-primary-200" />
      <p>{label}</p>
    </div>
  );
};

export default LoadingSpinner;
