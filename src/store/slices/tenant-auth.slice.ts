import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type TenantAuthState = { authenticated: boolean }
const initialState: TenantAuthState = { authenticated: false }

const tenantAuthSlice = createSlice({
  name: "tenantAuth",
  initialState,
  reducers: {
    tenantSessionStarted(state) { state.authenticated = true },
    tenantSessionEnded(state) { state.authenticated = false },
    setTenantAuthenticated(state, action: PayloadAction<boolean>) { state.authenticated = action.payload },
  },
})

export const { tenantSessionStarted, tenantSessionEnded, setTenantAuthenticated } = tenantAuthSlice.actions
export default tenantAuthSlice.reducer
