import { useParams } from "react-router"
import { CheckCircle2, Code2, LockKeyhole, ServerCog } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-provider"
import { TenantPageHeading } from "../../components/tenant-page-heading"
import { getTenantFeature } from "./tenant-feature-registry"
import { TenantFeatureForm } from "./tenant-feature-form"

const methodStyles: Record<string, string> = {
  GET: "bg-sky-50 text-sky-700",
  POST: "bg-emerald-50 text-emerald-700",
  PATCH: "bg-amber-50 text-amber-800",
  PUT: "bg-violet-50 text-violet-700",
  DELETE: "bg-rose-50 text-rose-700",
}

export function TenantFeaturePage() {
  const { feature: featureParam, section } = useParams()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const key = section ? `${featureParam}/${section}` : featureParam || ""
  const feature = getTenantFeature(key)

  if (!feature) {
    return (
      <Card className="border-white bg-white">
        <CardContent className="p-10 text-center">
          <h2 className="text-lg font-semibold">{ar ? "الصفحة غير موجودة" : "Page not found"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{key}</p>
        </CardContent>
      </Card>
    )
  }

  const title = feature.title[ar ? "ar" : "en"]
  const description = feature.description[ar ? "ar" : "en"]

  return (
    <div className="space-y-7">
      <TenantPageHeading
        eyebrow={feature.eyebrow[ar ? "ar" : "en"]}
        title={title}
        description={description}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          icon={ServerCog}
          label={ar ? "حالة التكامل" : "Integration status"}
          value={ar ? "بانتظار الباك" : "Backend pending"}
          description={ar ? "لا يتم إرسال طلبات وهمية لمسارات غير منفذة" : "No requests are sent to unimplemented endpoints"}
        />
        <StatusCard
          icon={LockKeyhole}
          label={ar ? "نطاق البيانات" : "Data boundary"}
          value={ar ? "Tenant-scoped" : "Tenant-scoped"}
          description={ar ? "كل العمليات يجب أن تظل داخل المؤسسة الحالية" : "All operations must stay within the active tenant"}
        />
        <StatusCard
          icon={CheckCircle2}
          label={ar ? "التحقق" : "Validation"}
          value={feature.schemaKey ? (ar ? "مجهز" : "Prepared") : (ar ? "حسب العقد" : "Contract-driven")}
          description={ar ? "التحقق المحلي لا يغني عن تحقق الباك" : "Client validation never replaces backend validation"}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="border-white bg-white">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <Code2 className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{ar ? "نطاق الوظائف" : "Feature scope"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{ar ? "المتطلبات المستخرجة من خطة المنتج" : "Requirements mapped from the product plan"}</p>
              </div>
            </div>
            <div className="space-y-3">
              {feature.capabilities.map((item, index) => (
                <div key={index} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6">{item[ar ? "ar" : "en"]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white bg-white">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{ar ? "حالة الباك" : "Backend readiness"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{ar ? "لا توجد اتصالات غير مؤكدة" : "No unverified API calls"}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                {ar ? "عقد مقترح — غير متصل" : "Proposed contract — not connected"}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {ar
                ? "تمت مراجعة كود الباك الحالي: المتاح فعلياً هو سياق المؤسسة والعيادات والفروع. باقي الوحدات لا تستدعي مسارات غير منفذة."
                : "The current backend exposes tenant context, clinics and branches. Other modules do not call routes that are not implemented."}
            </p>
            {feature.note && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
                {feature.note[ar ? "ar" : "en"]}
              </div>
            )}
          </CardContent>
        </Card>
      </section>



      <TenantFeatureForm feature={feature} />

      <Card className="border-white bg-white">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <Code2 className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold">{ar ? "عقد الـ API المقترح" : "Prepared API contract"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{ar ? "عقود مقترحة للمراجعة — لا يتم استدعاؤها قبل تنفيذها في الباك" : "Proposed contracts for review — not called until implemented by the backend"}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-start text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-3 py-3 text-start font-medium">{ar ? "الطريقة" : "Method"}</th>
                  <th className="px-3 py-3 text-start font-medium">Endpoint</th>
                  <th className="px-3 py-3 text-start font-medium">{ar ? "الغرض" : "Purpose"}</th>
                  <th className="px-3 py-3 text-start font-medium">{ar ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {feature.endpoints.map((endpoint) => (
                  <tr key={endpoint.method + endpoint.path} className="border-b last:border-0">
                    <td className="px-3 py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${methodStyles[endpoint.method]}`}>{endpoint.method}</span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs" dir="ltr">{endpoint.path}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{endpoint.purpose}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">{ar ? "غير منفذ في الباك الحالي" : "Not implemented in current backend"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, description }: {
  icon: typeof ServerCog
  label: string
  value: string
  description: string
}) {
  return (
    <Card className="border-white bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-lg font-semibold">{value}</p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="size-5" /></span>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
