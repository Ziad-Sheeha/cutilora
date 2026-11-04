import { configureStore } from "@reduxjs/toolkit"
import { rootReducer } from "./root-reducer"
export { beginLoading, endLoading, pushToast, dismissToast, setCurrentBranch } from "./slices/ui.slice"
export type { ToastKind, ToastMessage } from "./slices/ui.slice"

export const store = configureStore({ reducer: rootReducer })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
