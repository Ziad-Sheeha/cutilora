import { useRef, useState } from "react"
import { ImagePlus, Trash2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TenantImageUploadProps {
  id: string
  label: string
  value: string
  onChange: (base64: string) => void
  hint: string
  replaceLabel: string
  uploadLabel: string
  removeLabel: string
  invalidTypeLabel: string
  readErrorLabel: string
  tooLargeLabel: string
  previewLabel: string
  maxSizeMb?: number
}

export function TenantImageUpload({
  id, label, value, onChange, hint, replaceLabel, uploadLabel, removeLabel,
  invalidTypeLabel, readErrorLabel, tooLargeLabel, previewLabel, maxSizeMb = 5,
}: TenantImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [reading, setReading] = useState(false)

  async function handleFile(file?: File) {
    if (!file) return
    setError("")
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError(invalidTypeLabel)
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(tooLargeLabel)
      return
    }
    setReading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("FILE_READ_FAILED"))
        reader.onerror = () => reject(new Error("FILE_READ_FAILED"))
        reader.readAsDataURL(file)
      })
      onChange(base64)
    } catch {
      setError("FILE_READ_FAILED")
    } finally {
      setReading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-muted/20 p-3 sm:p-4">
        {value ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background sm:w-36">
              <img src={value} alt={previewLabel} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold"><ImagePlus className="size-4 text-primary"/>{previewLabel}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={reading}>
                  <UploadCloud className="size-4"/>{replaceLabel}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { onChange(""); setError("") }} disabled={reading}>
                  <Trash2 className="size-4 text-destructive"/>{removeLabel}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()} disabled={reading} className="flex h-auto min-h-32 w-full flex-col items-center justify-center rounded-xl px-4 py-5 text-center hover:bg-muted/60">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><UploadCloud className="size-5"/></span>
            <span className="mt-3 text-sm font-semibold">{reading ? "..." : uploadLabel}</span>
            <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
          </Button>
        )}
        <Input ref={inputRef} id={id} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
      </div>
      {error && <p role="alert" className="text-xs font-medium text-destructive">{error === "FILE_READ_FAILED" ? readErrorLabel : error}</p>}
    </div>
  )
}
