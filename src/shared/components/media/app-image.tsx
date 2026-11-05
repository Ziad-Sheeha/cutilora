import { useEffect, useState, type ReactNode } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppImageProps {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
  fallback?: ReactNode
  loadingStrategy?: "lazy" | "eager"
}

export function AppImage({
  src,
  alt,
  className,
  imageClassName,
  fallback,
  loadingStrategy = "lazy",
}: AppImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const hasSource = Boolean(src?.trim())
  const isRemoteImage = /^https?:\/\//i.test(src ?? "")

  useEffect(() => {
    setLoaded(false)
    setFailed(false)
  }, [src])

  return (
    <span className={cn("relative inline-flex min-w-0 items-center justify-center overflow-hidden", className)}>
      {hasSource && !failed && (
        <>
          {!loaded && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-muted" />}
          <img
            src={src ?? undefined}
            alt={alt}
            loading={loadingStrategy}
            decoding="async"
            crossOrigin={isRemoteImage ? "anonymous" : undefined}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "relative h-full w-full transition-opacity duration-200",
              loaded ? "opacity-100" : "opacity-0",
              imageClassName,
            )}
          />
        </>
      )}
      {(!hasSource || failed) && (
        <span className="flex h-full w-full items-center justify-center text-muted-foreground">
          {fallback ?? <ImageOff aria-hidden="true" className="size-5" />}
        </span>
      )}
    </span>
  )
}
