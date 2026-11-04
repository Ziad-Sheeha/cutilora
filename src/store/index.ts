import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import platformAuthReducer from "./slices/platform-auth.slice"
import tenantAuthReducer from "./slices/tenant-auth.slice"
import tenantContextReducer from "./slices/tenant-context.slice"
import clinicContextReducer from "./slices/clinic-context.slice"
import branchContextReducer from "./slices/branch-context.slice"

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

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    platformAuth: platformAuthReducer,
    tenantAuth: tenantAuthReducer,
    tenantContext: tenantContextReducer,
    clinicContext: clinicContextReducer,
    branchContext: branchContextReducer,
  },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
