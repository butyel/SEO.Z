import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
        idea: "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        draft: "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        review: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        needs_adjustments: "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        approved: "border-transparent bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        published: "border-transparent bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        failed: "border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        scheduled: "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
