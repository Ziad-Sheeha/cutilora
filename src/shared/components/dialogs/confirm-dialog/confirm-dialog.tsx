import { memo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-provider"
import type { ConfirmDialogProps } from "./confirm-dialog.types"
export const ConfirmDialog = memo(function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, isLoading = false, destructive = false, onOpenChange, onConfirm }: ConfirmDialogProps) {
 const { t } = useI18n()
 return <Dialog open={open} onOpenChange={(next) => { if (!isLoading) onOpenChange(next) }}><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>{cancelLabel ?? t.common.cancel}</Button><Button type="button" variant={destructive ? "destructive" : "default"} onClick={onConfirm} disabled={isLoading}>{confirmLabel ?? (destructive ? t.common.confirmDelete : t.common.confirm)}</Button></DialogFooter></DialogContent></Dialog>
})
