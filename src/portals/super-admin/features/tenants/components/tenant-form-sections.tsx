import { Building2, MapPin, Settings2, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectMenu, SelectMenuContent, SelectMenuItem, SelectMenuTrigger, SelectMenuValue } from "@/components/ui/select-menu"
import { PhoneNumberField } from "@/components/ui/phone-number-field"
import { GeoSearchSelect } from "@/portals/super-admin/features/geo-location/components/geo-search-select"
import { TenantFormField } from "./tenant-form-field"
import { TenantFormSection } from "./tenant-form-section"
import { TenantImageUpload } from "./tenant-image-upload"
import type { TenantFormValues } from "../types/tenant-form.types"

type Copy = Record<string, string>
type Update = (section: "contact" | "address" | "legal" | "branding" | "preferences", key: string, value: string) => void
type UpdateTop = (key: "name" | "displayName" | "legalName" | "businessType" | "description" | "industry", value: string) => void
interface SharedProps { values: TenantFormValues; copy: Copy; ar: boolean; update: Update }

export function TenantIdentitySection({ values, copy, ar, updateTop }: { values: TenantFormValues; copy: Copy; ar: boolean; updateTop: UpdateTop }) {
  return <TenantFormSection title={copy.identity} description={copy.identityHint} icon={Building2}>
    <TenantFormField id="tenant-name" label={copy.name} value={values.name} onChange={(value) => updateTop("name", value)} required autoComplete="organization"/>
    <TenantFormField id="tenant-display-name" label={copy.displayName} value={values.displayName} onChange={(value) => updateTop("displayName", value)}/>
    <TenantFormField id="tenant-legal-name" label={copy.legalName} value={values.legalName} onChange={(value) => updateTop("legalName", value)}/>
    <div className="space-y-2"><Label>{copy.businessType}<span className="ms-1 text-destructive">*</span></Label><SelectMenu value={values.businessType} onValueChange={(value) => updateTop("businessType", value)}><SelectMenuTrigger id="tenant-business-type" aria-invalid={!values.businessType || undefined} className={!values.businessType ? "border-destructive ring-1 ring-destructive/20" : ""}><SelectMenuValue placeholder={copy.choose}/></SelectMenuTrigger><SelectMenuContent>{values.businessType && !["single_clinic","clinic_group","medical_center"].includes(values.businessType) && <SelectMenuItem value={values.businessType}>{values.businessType}</SelectMenuItem>}<SelectMenuItem value="single_clinic">{ar ? "عيادة واحدة" : "Single clinic"}</SelectMenuItem><SelectMenuItem value="clinic_group">{ar ? "مجموعة عيادات" : "Clinic group"}</SelectMenuItem><SelectMenuItem value="medical_center">{ar ? "مركز طبي" : "Medical center"}</SelectMenuItem></SelectMenuContent></SelectMenu></div>
    <div className="space-y-2"><Label>{copy.industry}<span className="ms-1 text-destructive">*</span></Label><SelectMenu value={values.industry} onValueChange={(value) => updateTop("industry", value)}><SelectMenuTrigger id="tenant-industry" aria-invalid={!values.industry || undefined} className={!values.industry ? "border-destructive ring-1 ring-destructive/20" : ""}><SelectMenuValue placeholder={copy.choose}/></SelectMenuTrigger><SelectMenuContent>{values.industry && values.industry !== "aesthetic_medicine" && <SelectMenuItem value={values.industry}>{values.industry}</SelectMenuItem>}<SelectMenuItem value="aesthetic_medicine">{ar ? "الطب التجميلي" : "Aesthetic medicine"}</SelectMenuItem></SelectMenuContent></SelectMenu><p className="text-xs text-muted-foreground">{ar ? "المتاح حاليًا هو المجال المؤكد في بيانات الـ API." : "Only the industry key confirmed by the supplied API data is offered."}</p></div>
    <TenantFormField id="tenant-description" label={copy.description} value={values.description} onChange={(value) => updateTop("description", value)} multiline/>
  </TenantFormSection>
}

export function TenantContactSection({ values, copy, update }: SharedProps) {
  return <TenantFormSection title={copy.contact} description={copy.contactHint} icon={UserRound}>
    <TenantFormField id="tenant-email" label={copy.email} type="email" value={values.contact.email} onChange={(value) => update("contact", "email", value)} autoComplete="email"/>
    <PhoneNumberField id="tenant-phone" label={copy.phone} value={values.contact.phone} phoneCode={values.contact.phoneCode} onChange={(value) => update("contact", "phone", value)} onPhoneCodeChange={(value) => update("contact", "phoneCode", value)} placeholder="010 1234 5678"/>
    <PhoneNumberField id="tenant-alt-phone" label={copy.alternatePhone} value={values.contact.alternatePhone} phoneCode={values.contact.phoneCode} onChange={(value) => update("contact", "alternatePhone", value)} onPhoneCodeChange={(value) => update("contact", "phoneCode", value)} placeholder="010 1234 5678"/>
    <PhoneNumberField id="tenant-whatsapp" label={copy.whatsapp} value={values.contact.whatsapp} phoneCode={values.contact.phoneCode} onChange={(value) => update("contact", "whatsapp", value)} onPhoneCodeChange={(value) => update("contact", "phoneCode", value)} placeholder="010 1234 5678"/>
    <TenantFormField id="tenant-website" label={copy.website} type="url" value={values.contact.website} onChange={(value) => update("contact", "website", value)} placeholder="https://"/>
  </TenantFormSection>
}

export function TenantLocationSection({ values, copy, update, updateLocation }: SharedProps & { updateLocation: (kind: "countryId" | "governorateId" | "cityId" | "districtId", value: string) => void }) {
  return <TenantFormSection title={copy.location} description={copy.locationHint} icon={MapPin}>
    <div className="space-y-2"><Label>{copy.country}</Label><GeoSearchSelect kind="countries" value={values.address.countryId} onChange={(value) => updateLocation("countryId", value)} placeholder={copy.choose}/></div>
    <div className="space-y-2"><Label>{copy.governorate}</Label><GeoSearchSelect kind="governorates" value={values.address.governorateId} parentId={values.address.countryId} onChange={(value) => updateLocation("governorateId", value)} placeholder={copy.choose}/></div>
    <div className="space-y-2"><Label>{copy.city}</Label><GeoSearchSelect kind="cities" value={values.address.cityId} parentId={values.address.governorateId} onChange={(value) => updateLocation("cityId", value)} placeholder={copy.choose}/></div>
    <div className="space-y-2"><Label>{copy.district}</Label><GeoSearchSelect kind="districts" value={values.address.districtId} parentId={values.address.cityId} onChange={(value) => updateLocation("districtId", value)} placeholder={copy.choose}/></div>
    <TenantFormField id="tenant-address-1" label={copy.addressLine1} value={values.address.addressLine1} onChange={(value) => update("address", "addressLine1", value)}/>
    <TenantFormField id="tenant-address-2" label={copy.addressLine2} value={values.address.addressLine2} onChange={(value) => update("address", "addressLine2", value)}/>
    <TenantFormField id="tenant-building" label={copy.building} value={values.address.building} onChange={(value) => update("address", "building", value)}/>
    <TenantFormField id="tenant-floor" label={copy.floor} value={values.address.floor} onChange={(value) => update("address", "floor", value)}/>
    <TenantFormField id="tenant-unit" label={copy.unit} value={values.address.unit} onChange={(value) => update("address", "unit", value)}/>
    <TenantFormField id="tenant-postal" label={copy.postalCode} value={values.address.postalCode} onChange={(value) => update("address", "postalCode", value)}/>
    <TenantFormField id="tenant-latitude" label={copy.latitude} type="number" min="-90" max="90" step="any" value={values.address.latitude} onChange={(value) => update("address", "latitude", value)}/>
    <TenantFormField id="tenant-longitude" label={copy.longitude} type="number" min="-180" max="180" step="any" value={values.address.longitude} onChange={(value) => update("address", "longitude", value)}/>
  </TenantFormSection>
}

export function TenantLegalBrandingSection({ values, copy, ar, update }: SharedProps) {
  return <TenantFormSection title={copy.legal} description={copy.legalHint} icon={ShieldCheck}>
    <TenantFormField id="tenant-tax" label={copy.taxNumber} value={values.legal.taxNumber} onChange={(value) => update("legal", "taxNumber", value)}/>
    <TenantFormField id="tenant-vat" label={copy.vatNumber} value={values.legal.vatNumber} onChange={(value) => update("legal", "vatNumber", value)}/>
    <TenantFormField id="tenant-registration" label={copy.commercialRegistrationNumber} value={values.legal.commercialRegistrationNumber} onChange={(value) => update("legal", "commercialRegistrationNumber", value)}/>
    <TenantImageUpload id="tenant-logo" label={copy.logoUrl} value={values.branding.logoUrl} onChange={(value) => update("branding", "logoUrl", value)} hint={copy.uploadHint} uploadLabel={copy.upload} replaceLabel={copy.replace} removeLabel={copy.remove} invalidTypeLabel={copy.invalidImage} readErrorLabel={copy.readImageError} tooLargeLabel={copy.imageTooLarge} previewLabel={copy.preview}/>
    <TenantImageUpload id="tenant-cover" label={copy.coverImageUrl} value={values.branding.coverImageUrl} onChange={(value) => update("branding", "coverImageUrl", value)} hint={copy.uploadHint} uploadLabel={copy.upload} replaceLabel={copy.replace} removeLabel={copy.remove} invalidTypeLabel={copy.invalidImage} readErrorLabel={copy.readImageError} tooLargeLabel={copy.imageTooLarge} previewLabel={copy.preview}/>
    <div className="space-y-3 sm:col-span-2"><Label htmlFor="tenant-primary-color">{copy.primaryColor}</Label><div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/20 p-4"><span className="size-12 rounded-xl border shadow-inner" style={{backgroundColor: values.branding.primaryColor}}/><div className="min-w-0 flex-1"><p className="font-mono text-sm font-semibold">{values.branding.primaryColor.toUpperCase()}</p><p className="text-xs text-muted-foreground">{ar ? "اختر لونًا جاهزًا أو خصص اللون." : "Choose a curated color or open the custom picker."}</p></div><Input id="tenant-primary-color" type="color" value={values.branding.primaryColor} onChange={(event) => update("branding", "primaryColor", event.target.value)} className="h-11 w-16 cursor-pointer p-1"/></div><div className="flex flex-wrap gap-2">{["#2563eb","#6d4aff","#0f766e","#0e7490","#be123c","#b45309","#334155","#111827"].map((color) => <Button key={color} type="button" variant="outline" size="icon" aria-label={color} title={color} onClick={() => update("branding","primaryColor",color)} className={"size-8 rounded-full border-2 p-0 " + (values.branding.primaryColor.toLowerCase() === color ? "ring-2 ring-primary ring-offset-2" : "")} style={{backgroundColor:color}}/>)}</div></div>
  </TenantFormSection>
}

export function TenantPreferencesSection({ values, copy, ar, update, toggleLanguage }: SharedProps & { toggleLanguage: (language: string, checked: boolean) => void }) {
  return <TenantFormSection title={copy.preferences} description={copy.preferencesHint} icon={Settings2}>
    <div className="space-y-2"><Label>{copy.timezone}</Label><SelectMenu value={values.preferences.timezone} onValueChange={(value) => update("preferences", "timezone", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["Africa/Cairo","Asia/Riyadh","Asia/Dubai","Asia/Kuwait","Asia/Qatar","Asia/Bahrain","Asia/Muscat","UTC"].includes(values.preferences.timezone) && <SelectMenuItem value={values.preferences.timezone}>{values.preferences.timezone}</SelectMenuItem>}{["Africa/Cairo","Asia/Riyadh","Asia/Dubai","UTC"].map((zone) => <SelectMenuItem key={zone} value={zone}>{zone}</SelectMenuItem>)}</SelectMenuContent></SelectMenu></div>
    <div className="space-y-2"><Label>{copy.locale}</Label><SelectMenu value={values.preferences.locale} onValueChange={(value) => update("preferences", "locale", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["en","ar"].includes(values.preferences.locale) && <SelectMenuItem value={values.preferences.locale}>{values.preferences.locale}</SelectMenuItem>}<SelectMenuItem value="en">English</SelectMenuItem><SelectMenuItem value="ar">العربية</SelectMenuItem></SelectMenuContent></SelectMenu></div>
    <div className="space-y-2"><Label>{copy.currency}</Label><SelectMenu value={values.preferences.currency} onValueChange={(value) => update("preferences", "currency", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["EGP","SAR","AED","QAR","KWD","BHD","OMR","USD"].includes(values.preferences.currency) && <SelectMenuItem value={values.preferences.currency}>{values.preferences.currency}</SelectMenuItem>}<SelectMenuItem value="EGP">EGP — Egyptian Pound</SelectMenuItem><SelectMenuItem value="SAR">SAR — Saudi Riyal</SelectMenuItem><SelectMenuItem value="AED">AED — UAE Dirham</SelectMenuItem><SelectMenuItem value="QAR">QAR — Qatari Riyal</SelectMenuItem><SelectMenuItem value="KWD">KWD — Kuwaiti Dinar</SelectMenuItem><SelectMenuItem value="BHD">BHD — Bahraini Dinar</SelectMenuItem><SelectMenuItem value="OMR">OMR — Omani Rial</SelectMenuItem><SelectMenuItem value="USD">USD — US Dollar</SelectMenuItem></SelectMenuContent></SelectMenu></div>
    <div className="space-y-2"><Label>{copy.dateFormat}</Label><SelectMenu value={values.preferences.dateFormat} onValueChange={(value) => update("preferences", "dateFormat", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY"].includes(values.preferences.dateFormat) && <SelectMenuItem value={values.preferences.dateFormat}>{values.preferences.dateFormat}</SelectMenuItem>}<SelectMenuItem value="YYYY-MM-DD">YYYY-MM-DD</SelectMenuItem><SelectMenuItem value="DD/MM/YYYY">DD/MM/YYYY</SelectMenuItem><SelectMenuItem value="MM/DD/YYYY">MM/DD/YYYY</SelectMenuItem></SelectMenuContent></SelectMenu></div>
    <div className="space-y-2"><Label>{copy.weekStartsOn}</Label><SelectMenu value={values.preferences.weekStartsOn} onValueChange={(value) => update("preferences", "weekStartsOn", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{(ar ? ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"] : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]).map((day,index) => <SelectMenuItem key={index} value={String(index)}>{day}</SelectMenuItem>)}</SelectMenuContent></SelectMenu></div>
    <div className="space-y-3 sm:col-span-2"><Label>{copy.supportedLanguages}</Label><div className="flex flex-wrap gap-4 rounded-xl border bg-muted/20 p-4"><Label className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={values.preferences.supportedLanguages.includes("en")} onChange={(event) => toggleLanguage("en", event.target.checked)}/>{copy.english}</Label><Label className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={values.preferences.supportedLanguages.includes("ar")} onChange={(event) => toggleLanguage("ar", event.target.checked)}/>{copy.arabic}</Label></div></div>
  </TenantFormSection>
}

export function TenantOwnerSection({ values, copy, ar, updateOwner }: { values: TenantFormValues; copy: Copy; ar: boolean; updateOwner: (key: keyof TenantFormValues["owner"], value: string) => void }) {
  const password = values.owner.password
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)]
  const score = checks.filter(Boolean).length
  const strength = score <= 2 ? copy.passwordWeak : score === 3 ? copy.passwordFair : score === 4 ? copy.passwordGood : copy.passwordStrong
  return <TenantFormSection title={copy.owner} description={copy.ownerHint} icon={UserRound}>
    <TenantFormField id="tenant-owner-name" label={copy.ownerName} value={values.owner.name} onChange={(value) => updateOwner("name", value)} required autoComplete="name"/>
    <TenantFormField id="tenant-owner-email" label={copy.ownerEmail} type="email" value={values.owner.email} onChange={(value) => updateOwner("email", value)} required autoComplete="email"/>
    <div className="space-y-2"><TenantFormField id="tenant-owner-password" label={copy.ownerPassword} type="password" value={password} onChange={(value) => updateOwner("password", value)} required autoComplete="new-password"/>
      <div className="space-y-2 rounded-xl border bg-muted/20 p-3"><div className="flex items-center justify-between text-xs"><span className="font-medium">{ar ? "قوة كلمة المرور" : "Password strength"}</span><span className="font-semibold">{password ? strength : "—"}</span></div><div className="grid grid-cols-5 gap-1">{checks.map((valid,index) => <span key={index} className={"h-1.5 rounded-full " + (valid ? "bg-emerald-500" : "bg-muted-foreground/20")}/>)}</div><ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">{[ar ? "8 أحرف على الأقل" : "At least 8 characters",ar ? "حرف كبير" : "Uppercase letter",ar ? "حرف صغير" : "Lowercase letter",ar ? "رقم" : "Number",ar ? "رمز خاص" : "Special character"].map((rule,index) => <li key={rule} className={checks[index] ? "text-emerald-600" : ""}>{checks[index] ? "✓" : "○"} {rule}</li>)}</ul></div>
    </div>
    <TenantFormField id="tenant-owner-confirm" label={copy.ownerConfirm} type="password" value={values.owner.passwordConfirmation} onChange={(value) => updateOwner("passwordConfirmation", value)} required autoComplete="new-password"/>
    {values.owner.passwordConfirmation && password !== values.owner.passwordConfirmation && <p className="text-xs font-medium text-destructive">{copy.passwordMismatch}</p>}
  </TenantFormSection>
}
