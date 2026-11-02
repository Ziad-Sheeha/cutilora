import { useState } from "react"
import { useNavigate } from "react-router"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSuperAdmin } from "@/portals/super-admin/auth/super-admin-auth"

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid work email address.")
    .required("Work email is required."),
  password: Yup.string()
    .required("Password is required."),
})

type LoginFormValues = Yup.InferType<typeof loginSchema>

export function SuperAdminLoginForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined)
      try {
        await loginSuperAdmin(values.email.trim(), values.password)
        navigate("/super-admin", { replace: true })
      } catch (cause) {
        helpers.setStatus(
          cause instanceof Error
            ? cause.message
            : "We couldn't sign you in. Please try again.",
        )
      } finally {
        helpers.setSubmitting(false)
      }
    },
  })

  const emailError = formik.touched.email ? formik.errors.email : undefined
  const passwordError = formik.touched.password ? formik.errors.password : undefined

  return (
    <form className="w-full space-y-5" onSubmit={formik.handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="super-admin-email" className="text-sm font-medium text-slate-200">
          Work email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <Input
            id="super-admin-email"
            name="email"
            type="email"
            autoComplete="username"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="admin@cutilora.com"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "super-admin-email-error" : undefined}
            className="border-slate-700 bg-[#0B1020] ps-10 text-white placeholder:text-slate-500"
          />
        </div>
        {emailError && (
          <p id="super-admin-email-error" role="alert" className="text-sm text-red-300">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="super-admin-password" className="text-sm font-medium text-slate-200">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <Input
            id="super-admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter your password"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "super-admin-password-error" : undefined}
            className="border-slate-700 bg-[#0B1020] ps-10 pe-11 text-white placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {passwordError && (
          <p id="super-admin-password-error" role="alert" className="text-sm text-red-300">
            {passwordError}
          </p>
        )}
      </div>

      {formik.status && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-200">
          {formik.status}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={formik.isSubmitting}
        className="w-full bg-[#8B6AF8] text-white hover:bg-[#7651E8]"
      >
        {formik.isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in to platform"
        )}
      </Button>
      <p className="text-center text-xs leading-5 text-slate-500">
        Secure access for authorized Cutilora platform administrators.
      </p>
    </form>
  )
}