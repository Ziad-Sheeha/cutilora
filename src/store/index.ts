import { configureStore } from "@reduxjs/toolkit"
import { rootReducer } from "./root-reducer"
export { beginLoading, endLoading, pushToast, dismissToast, setCurrentBranch } from "./slices/ui.slice"
export type { ToastKind, ToastMessage } from "./slices/ui.slice"
export { platformSessionStarted, platformSessionEnded, setPlatformAuthenticated } from "./slices/platform-auth.slice"
export { tenantSessionStarted, tenantSessionEnded, setTenantAuthenticated } from "./slices/tenant-auth.slice"
export { setTenantId, clearTenantContext } from "./slices/tenant-context.slice"
export { setClinicId, clearClinicContext } from "./slices/clinic-context.slice"
export { setBranchId, clearBranchContext } from "./slices/branch-context.slice"

export const store = configureStore({ reducer: rootReducer })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
