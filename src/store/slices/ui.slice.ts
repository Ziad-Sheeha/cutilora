import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type ToastKind = "success" | "error" | "info" | "warning"
export type ToastMessage = { id: string; title: string; description?: string; kind: ToastKind }
type UiState = { loadingCount: number; toasts: ToastMessage[]; currentBranchId: string | null }

const uiSlice = createSlice({
  name: "ui",
  initialState: { loadingCount: 0, toasts: [], currentBranchId: "branch-main" } as UiState,
  reducers: {
    beginLoading(state) { state.loadingCount += 1 },
    endLoading(state) { state.loadingCount = Math.max(0, state.loadingCount - 1) },
    pushToast(state, action: PayloadAction<ToastMessage>) { state.toasts.push(action.payload) },
    dismissToast(state, action: PayloadAction<string>) { state.toasts = state.toasts.filter((toast) => toast.id !== action.payload) },
    setCurrentBranch(state, action: PayloadAction<string>) { state.currentBranchId = action.payload },
  },
})
export const { beginLoading, endLoading, pushToast, dismissToast, setCurrentBranch } = uiSlice.actions
export default uiSlice.reducer
