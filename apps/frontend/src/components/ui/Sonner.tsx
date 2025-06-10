import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      swipeDirection="right"
      swipeThreshold={60}
      duration={4000}
      expand={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:transition-all group-[.toaster]:duration-300",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:transition-opacity group-[.toast]:duration-200",
        },
        style: {
          "--swipe-move-x": "translateX(var(--swipe-offset-x))",
          "--swipe-move-y": "translateY(var(--swipe-offset-y))",
        },
      }}
      // Custom dismiss icon with animation
      closeButton={true}
      {...props}
    />
  )
}

export { Toaster }
