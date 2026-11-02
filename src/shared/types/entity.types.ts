export type EntityId = string | number
export type Identifiable = { id: EntityId }
export type NamedEntity = Identifiable & { name: string }
export type SelectOption<T extends string | number = string> = { label: string; value: T; disabled?: boolean }
export type AsyncState = "idle" | "loading" | "success" | "error"
