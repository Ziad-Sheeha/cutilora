import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Activity, CalendarDays, Clock3, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/i18n/i18n-provider"
import { useOutletContext } from "react-router"
import type { TenantOutletContext } from "../../../layout/tenant-layout"
import { updateTenantContext } from "../../../auth/tenant-session"
import { businessHoursDaySchema, branchHolidaySchema, getTenantFieldErrors } from "../../shared/tenant-feature-schemas"
import {
  assignBranchManager,
  createBranchHoliday,
  getBranchActivity,
  getBranchBusinessHours,
  getBranchHolidays,
  getBranchSettings,
  getTenantDirectoryUsers,
  replaceBranchBusinessHours,
  updateBranchSettings,
  type BranchActivity,
  type BranchHoliday,
  type BusinessHoursDay,
} from "../api/branch-operations.api"

const weekdayNames = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
}
const initialDays: BusinessHoursDay[] = Array.from({ length: 7 }, (_, weekday) => ({ weekday, isClosed: true, shifts: [] }))
function unwrapHolidayId(row: BranchHoliday) {
  return String(row._id ?? row.id ?? row.date + "-" + row.name)
}

export function BranchOperationsPage() {
  const { context, branches, refresh } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const queryClient = useQueryClient()
  const branchId = context?.access.branchId || context?.branch?._id || ""
  const selectedBranch = branches.find((branch) => branch._id === branchId)
  const [days, setDays] = useState<BusinessHoursDay[]>(initialDays)
  const [hoursError, setHoursError] = useState("")
  const [holidayOpen, setHolidayOpen] = useState(false)
  const [holidayName, setHolidayName] = useState("")
  const [holidayDate, setHolidayDate] = useState("")
  const [holidayClosed, setHolidayClosed] = useState("closed")
  const [holidayOpens, setHolidayOpens] = useState("09:00")
  const [holidayCloses, setHolidayCloses] = useState("17:00")
  const [holidayError, setHolidayError] = useState("")
  const [branchTimezone, setBranchTimezone] = useState("Africa/Cairo")
  const [branchStatus, setBranchStatus] = useState("active")
  const [managerId, setManagerId] = useState("")
  const [settingsError, setSettingsError] = useState("")

  const hoursQuery = useQuery({
    queryKey: ["tenant-branch-hours", branchId],
    queryFn: () => getBranchBusinessHours(branchId),
    enabled: Boolean(branchId),
  })
  const holidaysQuery = useQuery({
    queryKey: ["tenant-branch-holidays", branchId],
    queryFn: () => getBranchHolidays(branchId),
    enabled: Boolean(branchId),
  })
  const settingsQuery = useQuery({
    queryKey: ["tenant-branch-settings", branchId],
    queryFn: () => getBranchSettings(branchId),
    enabled: Boolean(branchId),
  })
  const activityQuery = useQuery({
    queryKey: ["tenant-branch-activity", branchId],
    queryFn: () => getBranchActivity(branchId),
    enabled: Boolean(branchId),
  })
  const usersQuery = useQuery({
    queryKey: ["tenant-directory-users"],
    queryFn: getTenantDirectoryUsers,
    enabled: Boolean(branchId),
    staleTime: 60_000,
  })
  useEffect(() => {
    if (!settingsQuery.data) return
    setBranchTimezone(settingsQuery.data.timezone ?? selectedBranch?.timezone ?? "Africa/Cairo")
    setBranchStatus(settingsQuery.data.status ?? selectedBranch?.status ?? "active")
    setManagerId(settingsQuery.data.managerId ?? "")
  }, [settingsQuery.data, selectedBranch?.timezone, selectedBranch?.status])
  useEffect(() => {
    if (hoursQuery.data?.length) {
      const mapped: BusinessHoursDay[] = initialDays.map((day) => ({ ...day, shifts: [] }))
      hoursQuery.data.forEach((day) => { if (day.weekday >= 0 && day.weekday <= 6) mapped[day.weekday] = { ...day, shifts: day.shifts ?? [] } })
      setDays(mapped)
    }
  }, [hoursQuery.data])

  const saveHours = useMutation({
    mutationFn: () => replaceBranchBusinessHours(branchId, days),
    onSuccess: async () => {
      setHoursError("")
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["tenant-branch-hours", branchId] }), queryClient.invalidateQueries({ queryKey: ["tenant-branch-activity", branchId] })])
    },
    onError: (error) => setHoursError(error instanceof Error ? error.message : (ar ? "تعذر حفظ مواعيد العمل" : "Unable to save business hours")),
  })
  const createHoliday = useMutation({
    mutationFn: (payload: Omit<BranchHoliday, "_id" | "id" | "createdAt" | "updatedAt">) => createBranchHoliday(branchId, payload),
    onSuccess: async () => {
      setHolidayOpen(false)
      setHolidayName("")
      setHolidayDate("")
      setHolidayError("")
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["tenant-branch-holidays", branchId] }), queryClient.invalidateQueries({ queryKey: ["tenant-branch-activity", branchId] })])
    },
    onError: (error) => setHolidayError(error instanceof Error ? error.message : (ar ? "تعذر إضافة العطلة" : "Unable to create holiday")),
  })
  const saveSettings = useMutation({
    mutationFn: () => updateBranchSettings(branchId, { timezone: branchTimezone, status: branchStatus }),
    onSuccess: async () => {
      setSettingsError("")
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["tenant-branch-settings", branchId] }), queryClient.invalidateQueries({ queryKey: ["tenant-branch-activity", branchId] }), refresh()])
    },
    onError: error => setSettingsError(error instanceof Error ? error.message : (ar ? "تعذر حفظ إعدادات الفرع." : "Unable to save branch settings.")),
  })
  const saveManager = useMutation({
    mutationFn: () => assignBranchManager(branchId, managerId),
    onSuccess: async () => {
      setSettingsError("")
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["tenant-branch-settings", branchId] }), queryClient.invalidateQueries({ queryKey: ["tenant-branch-activity", branchId] })])
    },
    onError: error => setSettingsError(error instanceof Error ? error.message : (ar ? "تعذر تعيين مدير الفرع." : "Unable to assign branch manager.")),
  })
  const activityColumns = useMemo<DataTableColumn<BranchActivity>[]>(() => [
    { id: "action", header: ar ? "الإجراء" : "Action", cell: row => <span className="font-medium">{row.action ?? row.description ?? "—"}</span> },
    { id: "actor", header: ar ? "المنفذ" : "Performed by", cell: row => row.actor ?? "—" },
    { id: "module", header: ar ? "الوحدة" : "Module", cell: row => row.module ?? "—" },
    { id: "createdAt", header: ar ? "التاريخ" : "Date", cell: row => row.createdAt ? new Date(row.createdAt).toLocaleString(ar ? "ar-EG" : "en-US") : "—" },
  ], [ar])

  const holidayColumns = useMemo<DataTableColumn<BranchHoliday>[]>(() => [
    { id: "name", header: ar ? "العطلة" : "Holiday", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "date", header: ar ? "التاريخ" : "Date", cell: (row) => <time className="text-sm tabular-nums">{row.date}</time> },
    { id: "type", header: ar ? "نوع اليوم" : "Day type", cell: (row) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{row.isClosed ? (ar ? "مغلق" : "Closed") : (ar ? "مواعيد استثنائية" : "Special hours")}</span> },
    { id: "hours", header: ar ? "المواعيد" : "Hours", cell: (row) => row.isClosed ? "—" : [row.overrideOpensAt, row.overrideClosesAt].filter(Boolean).join(" – ") },
  ], [ar])

  function updateDay(weekday: number, update: Partial<BusinessHoursDay>) {
    setDays((current) => current.map((day) => day.weekday === weekday ? { ...day, ...update } : day))
  }
  function updateShift(weekday: number, index: number, key: "opensAt" | "closesAt", value: string) {
    setDays((current) => current.map((day) => day.weekday === weekday ? { ...day, shifts: day.shifts.map((shift, shiftIndex) => shiftIndex === index ? { ...shift, [key]: value } : shift) } : day))
  }
  function addShift(weekday: number) {
    setDays((current) => current.map((day) => day.weekday === weekday && day.shifts.length < 2 ? { ...day, isClosed: false, shifts: [...day.shifts, { opensAt: "09:00", closesAt: "17:00" }] } : day))
  }
  function removeShift(weekday: number, index: number) {
    setDays((current) => current.map((day) => day.weekday === weekday ? { ...day, shifts: day.shifts.filter((_, shiftIndex) => shiftIndex !== index) } : day))
  }
  async function submitHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    for (const day of days) {
      const result = businessHoursDaySchema.safeParse(day)
      if (!result.success) {
        setHoursError(getTenantFieldErrors(result.error, ar ? "ar" : "en").shifts ?? (ar ? "راجع مواعيد اليوم والفترات المتداخلة." : "Review the day's hours and overlapping shifts."))
        return
      }
    }
    setHoursError("")
    saveHours.mutate()
  }
  async function submitHoliday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = {
      name: holidayName.trim(),
      date: holidayDate,
      isClosed: holidayClosed === "closed",
      ...(holidayClosed === "open" ? { overrideOpensAt: holidayOpens, overrideClosesAt: holidayCloses } : {}),
    }
    const result = branchHolidaySchema.safeParse(payload)
    if (!result.success) {
      setHolidayError(getTenantFieldErrors(result.error, ar ? "ar" : "en").date ?? (ar ? "راجع بيانات العطلة." : "Review the holiday details."))
      return
    }
    createHoliday.mutate(payload)
  }

  return (
    <div className="space-y-7">
      <header><p className="text-xs font-semibold uppercase tracking-wider text-primary">{ar ? "تشغيل الفروع" : "BRANCH OPERATIONS"}</p><h1 className="mt-2 text-2xl font-semibold">{ar ? "مواعيد العمل والعطلات" : "Business hours & holidays"}</h1><p className="mt-2 text-sm text-muted-foreground">{ar ? "اضبط ساعات العمل والإغلاقات الاستثنائية وفق المنطقة الزمنية لكل فرع." : "Configure weekly hours and exceptional closures using each branch's timezone."}</p></header>
      <Card><CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-muted-foreground">{ar ? "الفرع المحدد" : "Selected branch"}</p><p className="mt-1 font-semibold">{selectedBranch?.name ?? context?.branch?.name ?? (ar ? "لم يتم اختيار فرع" : "No branch selected")}</p></div><Select value={branchId || "none"} onValueChange={async (value) => { if (value !== "none") { updateTenantContext({ branchId: value }); await refresh() } }}><SelectTrigger className="sm:w-72"><SelectValue placeholder={ar ? "اختر فرعاً" : "Select a branch"}/></SelectTrigger><SelectContent><SelectItem value="none">{ar ? "اختر فرعاً" : "Select a branch"}</SelectItem>{branches.map((branch) => <SelectItem key={branch._id} value={branch._id}>{branch.name}</SelectItem>)}</SelectContent></Select></div>
      </CardContent></Card>

      {!branchId ? <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{ar ? "اختر فرعاً لعرض مواعيد العمل والعطلات." : "Select a branch to manage its business hours and holidays."}</CardContent></Card> : (
        <>
          <Card><CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Clock3 className="size-5"/></span><div><h2 className="font-semibold">{ar ? "الجدول الأسبوعي" : "Weekly schedule"}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? "حتى فترتين عمل يومياً، دون تداخل." : "Up to two non-overlapping shifts per day."}</p></div></div>
            {hoursQuery.isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">{ar ? "جارٍ تحميل المواعيد..." : "Loading schedule..."}</p> : (
              <form onSubmit={submitHours} className="space-y-3">
                {days.map((day) => (
                  <div key={day.weekday} className="grid gap-3 rounded-xl border p-3 lg:grid-cols-[130px_150px_minmax(0,1fr)_auto] lg:items-center">
                    <p className="text-sm font-semibold">{weekdayNames[ar ? "ar" : "en"][day.weekday]}</p>
                    <Select value={day.isClosed ? "closed" : "open"} onValueChange={(value) => updateDay(day.weekday, { isClosed: value === "closed", shifts: value === "closed" ? [] : (day.shifts.length ? day.shifts : [{ opensAt: "09:00", closesAt: "17:00" }]) })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="open">{ar ? "مفتوح" : "Open"}</SelectItem><SelectItem value="closed">{ar ? "مغلق" : "Closed"}</SelectItem></SelectContent></Select>
                    <div className="space-y-2">{!day.isClosed && day.shifts.map((shift, index) => <div key={index} className="flex flex-wrap items-center gap-2"><Label className="w-16 text-xs">{ar ? "فترة" : "Shift"} {index + 1}</Label><Input type="time" value={shift.opensAt} onChange={(event) => updateShift(day.weekday, index, "opensAt", event.target.value)} className="w-32"/><span className="text-xs text-muted-foreground">{ar ? "إلى" : "to"}</span><Input type="time" value={shift.closesAt} onChange={(event) => updateShift(day.weekday, index, "closesAt", event.target.value)} className="w-32"/><Button type="button" size="icon" variant="ghost" onClick={() => removeShift(day.weekday, index)} aria-label={ar ? "حذف الفترة" : "Remove shift"}><Trash2 className="size-4 text-destructive"/></Button></div>)}</div>
                    <div className="flex justify-end">{!day.isClosed && day.shifts.length < 2 && <Button type="button" size="sm" variant="outline" onClick={() => addShift(day.weekday)}><Plus className="me-1 size-3.5"/>{ar ? "إضافة فترة" : "Add shift"}</Button>}</div>
                  </div>
                ))}
                {hoursError && <p role="alert" className="text-sm text-destructive">{hoursError}</p>}
                <div className="flex justify-end"><Button type="submit" loading={saveHours.isPending} disabled={saveHours.isPending}><Save className="me-2 size-4"/>{ar ? "حفظ المواعيد" : "Save schedule"}</Button></div>
              </form>
            )}
          </CardContent></Card>

          <Card><CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><CalendarDays className="size-5"/></span><div><h2 className="font-semibold">{ar ? "العطلات والإغلاقات" : "Holidays & closures"}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? "مواعيد استثنائية خاصة بالفرع." : "Branch-specific holiday and exceptional opening dates."}</p></div></div><Button type="button" onClick={() => { setHolidayOpen((open) => !open); setHolidayError("") }}><Plus className="me-2 size-4"/>{ar ? "إضافة عطلة" : "Add holiday"}</Button></div>
            {holidayOpen && <form onSubmit={submitHoliday} className="mb-5 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2"><div><Label>{ar ? "اسم العطلة" : "Holiday name"}</Label><Input value={holidayName} onChange={(event) => setHolidayName(event.target.value)} required/></div><div><Label>{ar ? "التاريخ" : "Date"}</Label><Input type="date" value={holidayDate} onChange={(event) => setHolidayDate(event.target.value)} required/></div><div><Label>{ar ? "حالة الفرع" : "Branch availability"}</Label><Select value={holidayClosed} onValueChange={setHolidayClosed}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="closed">{ar ? "مغلق طوال اليوم" : "Closed all day"}</SelectItem><SelectItem value="open">{ar ? "مواعيد عمل استثنائية" : "Special opening hours"}</SelectItem></SelectContent></Select></div>{holidayClosed === "open" && <div className="flex items-end gap-2"><div className="flex-1"><Label>{ar ? "من" : "Opens"}</Label><Input type="time" value={holidayOpens} onChange={(event) => setHolidayOpens(event.target.value)}/></div><div className="flex-1"><Label>{ar ? "إلى" : "Closes"}</Label><Input type="time" value={holidayCloses} onChange={(event) => setHolidayCloses(event.target.value)}/></div></div>}{holidayError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{holidayError}</p>}<div className="flex gap-2 sm:col-span-2"><Button type="submit" loading={createHoliday.isPending} disabled={createHoliday.isPending}>{ar ? "حفظ العطلة" : "Save holiday"}</Button><Button type="button" variant="outline" onClick={() => setHolidayOpen(false)}>{ar ? "إلغاء" : "Cancel"}</Button></div></form>}
            {holidaysQuery.isError && <p role="alert" className="mb-3 text-sm text-destructive">{holidaysQuery.error instanceof Error ? holidaysQuery.error.message : (ar ? "تعذر تحميل العطلات" : "Unable to load holidays")}</p>}
            <DataTable columns={holidayColumns} data={holidaysQuery.data ?? []} getRowId={unwrapHolidayId} isLoading={holidaysQuery.isLoading} loadingLabel={ar ? "جارٍ تحميل العطلات..." : "Loading holidays..."} emptyState={<div className="py-12 text-center text-sm text-muted-foreground">{ar ? "لا توجد عطلات مسجلة لهذا الفرع." : "No holidays have been recorded for this branch."}</div>}/>
          </CardContent></Card>

          <Card><CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Save className="size-5"/></span><div><h2 className="font-semibold">{ar ? "إعدادات الفرع ومديره" : "Branch settings & manager"}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? "حدّث المنطقة الزمنية والحالة وعيّن مديراً للفرع." : "Update the branch timezone and status, and assign its manager."}</p></div></div>
            {settingsQuery.isLoading ? <p className="py-6 text-center text-sm text-muted-foreground">{ar ? "جارٍ تحميل الإعدادات..." : "Loading settings..."}</p> : <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>{ar ? "المنطقة الزمنية" : "Timezone"}</Label><Input value={branchTimezone} onChange={event => setBranchTimezone(event.target.value)} placeholder="Africa/Cairo" className="mt-2"/></div>
              <div><Label>{ar ? "حالة الفرع" : "Branch status"}</Label><Select value={branchStatus} onValueChange={setBranchStatus}><SelectTrigger className="mt-2"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">{ar ? "نشط" : "Active"}</SelectItem><SelectItem value="inactive">{ar ? "غير نشط" : "Inactive"}</SelectItem><SelectItem value="suspended">{ar ? "موقوف" : "Suspended"}</SelectItem></SelectContent></Select></div>
              <div className="sm:col-span-2 flex flex-wrap justify-end"><Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>{saveSettings.isPending ? (ar ? "جارٍ الحفظ..." : "Saving...") : (ar ? "حفظ الإعدادات" : "Save settings")}</Button></div>
              <div className="sm:col-span-2 border-t pt-4"><Label>{ar ? "مدير الفرع" : "Branch manager"}</Label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><Select value={managerId || "none"} onValueChange={setManagerId}><SelectTrigger className="sm:flex-1"><SelectValue placeholder={ar ? "اختر مديراً" : "Select a manager"}/></SelectTrigger><SelectContent><SelectItem value="none">{ar ? "بدون مدير" : "No manager"}</SelectItem>{(usersQuery.data ?? []).map(user => { const id = String(user.id ?? user._id ?? ""); return id ? <SelectItem key={id} value={id}>{user.name ?? user.email ?? id}</SelectItem> : null })}</SelectContent></Select><Button variant="outline" onClick={() => saveManager.mutate()} disabled={!managerId || managerId === "none" || saveManager.isPending}>{saveManager.isPending ? (ar ? "جارٍ التعيين..." : "Assigning...") : (ar ? "تعيين المدير" : "Assign manager")}</Button></div></div>
              {settingsError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{settingsError}</p>}
              {settingsQuery.isError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{settingsQuery.error instanceof Error ? settingsQuery.error.message : (ar ? "تعذر تحميل إعدادات الفرع." : "Unable to load branch settings.")}</p>}
            </div>}
          </CardContent></Card>

          <Card><CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><Activity className="size-5"/></span><div><h2 className="font-semibold">{ar ? "سجل نشاط الفرع" : "Branch activity"}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? "سجل للقراءة فقط يوضح التغييرات والأحداث." : "Read-only history of branch changes and events."}</p></div></div>
            {activityQuery.isError && <p role="alert" className="mb-3 text-sm text-destructive">{activityQuery.error instanceof Error ? activityQuery.error.message : (ar ? "تعذر تحميل سجل النشاط." : "Unable to load activity.")}</p>}
            <DataTable columns={activityColumns} data={activityQuery.data ?? []} getRowId={row => String(row.id ?? row._id ?? row.createdAt ?? JSON.stringify(row))} isLoading={activityQuery.isLoading} loadingLabel={ar ? "جارٍ تحميل النشاط..." : "Loading activity..."} emptyState={<p className="py-10 text-center text-sm text-muted-foreground">{ar ? "لا توجد أحداث مسجلة لهذا الفرع." : "No activity has been recorded for this branch."}</p>}/>
          </CardContent></Card>
        </>
      )}
    </div>
  )
}
