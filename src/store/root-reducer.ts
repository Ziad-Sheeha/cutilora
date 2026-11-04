import platformAuth from "./slices/platform-auth.slice"
import tenantAuth from "./slices/tenant-auth.slice"
import tenantContext from "./slices/tenant-context.slice"
import clinicContext from "./slices/clinic-context.slice"
import branchContext from "./slices/branch-context.slice"
import ui from "./slices/ui.slice"

export const rootReducer = {
  ui,
  platformAuth,
  tenantAuth,
  tenantContext,
  clinicContext,
  branchContext,
}
