import { useSyncExternalStore } from "react"
import { store, type AppDispatch, type RootState } from "./index"
export const useAppDispatch = (): AppDispatch => store.dispatch
export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()), () => selector(store.getState()))
}
