import * as React from "react"

export interface ToastProps {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ToastActionElement {
  altText: string
}

// Simple toast implementation for now
export const Toast = ({ title, description }: ToastProps) => {
  return (
    <div className="fixed top-4 right-4 bg-background border rounded-lg p-4 shadow-lg z-50">
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
    </div>
  )
}
