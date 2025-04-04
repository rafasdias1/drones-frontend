// Vamos substituir o componente Tooltip baseado em Radix UI por uma implementação simples com React

import React from "react"
import { cn } from "../../lib/utils"

interface TooltipProps {
  children: React.ReactNode
}

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const TooltipTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({
  children,
  asChild = false,
  ...props
}) => {
  return <div {...props}>{children}</div>
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-50 absolute bottom-full mb-2 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-sm shadow-md",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

