import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type BranchContextState = { branchId: string | null }
const initialState: BranchContextState = { branchId: null }

const slice = createSlice({
  name: "branchContext",
  initialState: { branchId: "branch-main" } as BranchContextState,
  reducers: {
    setBranchId(state, action: PayloadAction<string | null>) { state.branchId = action.payload },
    clearBranchContext(state) { state.branchId = null },
  },
})
export const { setBranchId, clearBranchContext } = slice.actions
export default slice.reducer
