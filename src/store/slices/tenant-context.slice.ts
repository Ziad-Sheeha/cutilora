import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type TenantContextState = { tenantId: string | null }
const initialState: TenantContextState = { tenantId: null }

const slice = createSlice({
  name: "tenantContext",
  initialState,
  reducers: {
    setTenantId(state, action: PayloadAction<string | null>) { state.tenantId = action.payload },
    clearTenantContext(state) { state.tenantId = null },
  },
})
export const { setTenantId, clearTenantContext } = slice.actions
export default slice.reducer
