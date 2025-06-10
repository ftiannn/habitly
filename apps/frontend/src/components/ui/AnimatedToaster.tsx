import { toast } from "sonner";

export const AnimatedToast = {
    success: (message: string) => {
      return toast.success(message, {
        // ...options,
        className: "animate-in zoom-in-95 duration-300",
      });
    },
    error: (message: string) => {
      return toast.error(message, {
        // ...options,
        className: "animate-in zoom-in-95 duration-300",
      });
    },
    info: (message: string) => {
      return toast.info(message, {
        // ...options,
        className: "animate-in zoom-in-95 duration-300",
      });
    },
  };