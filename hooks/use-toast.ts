"use client"

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = (props: ToastProps) => {
    console.log("Toast called:", props);
  };

  return {
    toast
  };
}
