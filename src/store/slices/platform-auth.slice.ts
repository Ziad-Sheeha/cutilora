import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type PlatformAuthState = { authenticated: boolean }
const initialState: PlatformAuthState = { authenticated: false }

const platformAuthSlice = createSlice({
  name: "platformAuth",
  initialState,
  reducers: {
    platformSessionStarted(state) { state.authenticated = true },
    platformSessionEnded(state) { state.authenticated = false },
    setPlatformAuthenticated(state, action: PayloadAction<boolean>) { state.authenticated = action.payload },
  },
})

export const { platformSessionStarted, platformSessionEnded, setPlatformAuthenticated } = platformAuthSlice.actions
export default platformAuthSlice.reducer
