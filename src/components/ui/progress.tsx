// components/ui/progress.tsx

import * as React from "react"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-200", className)}
        {...props}
      >
        <div
          className="h-full bg-blue-600 transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, value ?? 0))}%`,
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
