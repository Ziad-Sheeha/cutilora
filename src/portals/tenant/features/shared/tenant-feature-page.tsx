import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { AlertCircle, ArrowUpRight, CheckCircle2, Code2, LoaderCircle, LockKeyhole, RefreshCw, ServerCog } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-provider"
import { TenantPageHeading } from "../../components/tenant-page-heading"
import { getTenantFeature } from "./tenant-feature-registry"
import { TenantFeatureForm } from "./tenant-feature-form"
import { fetchTenantFeatureRecords, getTenantFeatureListEndpoint, type TenantFeatureRecord } from "./tenant-feature-api"
import { Button } from "@/components/ui/button"

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
          description={ar ? "الواجهة والعقد جاهزان للتوصيل" : "UI and API contract are scaffolded"}
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
                <p className="mt-1 text-xs text-muted-foreground">{ar ? "لا توجد عمليات وهمية" : "No fake requests are made"}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                {ar ? "قيد التنفيذ" : "Pending"}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {ar
                ? "كل الأزرار والعمليات التي تحتاج Endpoint غير منفذ ستظل غير مفعلة أو في وضع المعاينة حتى يوفر الباك العقد النهائي."
                : "Actions that require an unimplemented endpoint remain unavailable or preview-only until the backend contract is delivered."}
            </p>
            {feature.note && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
                {feature.note[ar ? "ar" : "en"]}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {listEndpoint && (
        <Card className="border-white bg-white">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{ar ? "البيانات الفعلية" : "Live records"}</h3>
                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{listEndpoint.path}</p>
              </div>
              <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => setReloadKey((value) => value + 1)}>
                <RefreshCw className={`me-2 size-4 ${loading ? "animate-spin" : ""}`} />
                {ar ? "تحديث" : "Refresh"}
              </Button>
            </div>
            {loading ? (
              <div role="status" className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{ar ? "جاري تحميل البيانات..." : "Loading records..."}</div>
            ) : loadError ? (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{loadError}</span></div>
            ) : records.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{ar ? "لا توجد سجلات لعرضها حالياً." : "No records found."}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead><tr className="border-b text-start text-xs text-muted-foreground"><th className="px-3 py-3 text-start">{ar ? "السجل" : "Record"}</th><th className="px-3 py-3 text-start">{ar ? "الحالة" : "Status"}</th><th className="px-3 py-3 text-start">{ar ? "تاريخ الإنشاء" : "Created at"}</th></tr></thead>
                  <tbody>{records.map((record, index) => {
                    const id = String(record.id ?? record._id ?? index)
                    const label = String(record.name ?? record.displayName ?? record.email ?? record.title ?? id)
                    const status = String(record.status ?? "—")
                    const createdAt = record.createdAt ? new Date(String(record.createdAt)).toLocaleString(ar ? "ar-EG" : "en-US") : "—"
                    return <tr key={id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{label}</td><td className="px-3 py-3 text-muted-foreground">{status}</td><td className="px-3 py-3 text-xs text-muted-foreground">{createdAt}</td></tr>
                  })}</tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TenantFeatureForm feature={feature} />

      <Card className="border-white bg-white">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <Code2 className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold">{ar ? "عقد الـ API المقترح" : "Prepared API contract"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{ar ? "مسارات جاهزة للمراجعة والاتفاق مع الباك" : "Routes prepared for backend review and alignment"}</p>
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
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">{ar ? "بانتظار الباك" : "Backend pending"}</span>
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
