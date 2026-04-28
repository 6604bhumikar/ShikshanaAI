import * as React from "react";
import { cn } from "@/lib/utils"; // if you don’t have utils, replace this with a simple className merge.

export const Progress = React.forwardRef(
  ({ value, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${value || 0}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";
