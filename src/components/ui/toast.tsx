"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastContextProps {
  toasts: ToastProps[]
  addToast: (toast: ToastProps) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextProps | null>(null)

function useToastContext() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("Toast components must be used within ToastProvider")
  return ctx
}

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  action?: React.ReactNode
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: ToastProps) => {
    setToasts((prev) => [...prev, toast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const toastVariants = cva(
  "relative flex w-full items-center justify-between gap-2 rounded-md border p-4 shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastItemProps extends ToastProps {
  onClose: () => void
}

function ToastItem({ title, description, variant, action, onClose }: ToastItemProps) {
  return (
    <div className={cn(toastVariants({ variant }), "animate-in slide-in-from-right-full")}>
      <div className="flex flex-col gap-1 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      {action}
      <button onClick={onClose} className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
)
ToastViewport.displayName = "ToastViewport"

const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  )
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
  )
)
ToastDescription.displayName = "ToastDescription"

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  useToastContext,
  type ToastProps,
}
