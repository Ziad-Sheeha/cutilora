import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type ClinicContextState = { clinicId: string | null }
const initialState: ClinicContextState = { clinicId: null }

const slice = createSlice({
  name: "clinicContext",
  initialState,
  reducers: {
    setClinicId(state, action: PayloadAction<string | null>) { state.clinicId = action.payload },
    clearClinicContext(state) { state.clinicId = null },
  },
})
export const { setClinicId, clearClinicContext } = slice.actions
export default slice.reducer
