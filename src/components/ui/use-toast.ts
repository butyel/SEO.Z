"use client"

import { useToastContext, type ToastProps } from "@/components/ui/toast"

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

interface ToastInput {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  action?: React.ReactNode
}

function useToast() {
  const { addToast, removeToast } = useToastContext()

  const toast = (input: ToastInput) => {
    const id = genId()
    addToast({ id, ...input })
    return { id, dismiss: () => removeToast(id) }
  }

  return { toast, dismiss: removeToast }
}

export { useToast, type ToastInput }
