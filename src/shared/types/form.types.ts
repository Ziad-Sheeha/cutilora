export type FormMode = "create" | "edit" | "view"
export type FormStatus = "idle" | "submitting" | "success" | "error"
export type FieldErrorMap<T extends string = string> = Partial<Record<T, string>>
