import type { TenantFormValues } from "../types/tenant-form.types"
import { useGeoDetail } from "@/portals/super-admin/features/geo-location/hooks/use-geo-location"
import { geoConfigs, geoRecordName } from "@/portals/super-admin/features/geo-location/types/geo-location.types"

export function TenantPdfDocument({ values, tenantId, slug, locale }: {
  values: TenantFormValues
  tenantId: string
  slug: string
  locale: string
}) {
  const ar = locale === "ar"
  const country = useGeoDetail(geoConfigs.countries.endpoint, values.address.countryId || undefined)
  const governorate = useGeoDetail(geoConfigs.governorates.endpoint, values.address.governorateId || undefined)
  const city = useGeoDetail(geoConfigs.cities.endpoint, values.address.cityId || undefined)
  const district = useGeoDetail(geoConfigs.districts.endpoint, values.address.districtId || undefined)
  const groups = [
    { title: ar ? "الهوية الأساسية" : "Organization identity", rows: [
      [ar ? "اسم المؤسسة" : "Organization name", values.name],
      [ar ? "الاسم الظاهر" : "Display name", values.displayName],
      [ar ? "الاسم القانوني" : "Legal name", values.legalName],
      [ar ? "نوع النشاط" : "Business type", values.businessType],
      [ar ? "المجال" : "Industry", values.industry],
      [ar ? "الوصف" : "Description", values.description],
    ] },
    { title: ar ? "بيانات التواصل" : "Contact information", rows: [
      ["Email", values.contact.email], ["Phone", values.contact.phone], ["Alternate phone", values.contact.alternatePhone],
      ["WhatsApp", values.contact.whatsapp], ["Website", values.contact.website],
    ] },
    { title: ar ? "العنوان والموقع" : "Address & location", rows: [
      ["Country", country.data ? geoRecordName(country.data, locale) : ""], ["Governorate", governorate.data ? geoRecordName(governorate.data, locale) : ""], ["City", city.data ? geoRecordName(city.data, locale) : ""], ["District", district.data ? geoRecordName(district.data, locale) : ""], ["Address", values.address.addressLine1], ["Additional address", values.address.addressLine2],
      ["Building", values.address.building], ["Floor", values.address.floor], ["Unit", values.address.unit],
      ["Landmark", values.address.landmark], ["Postal code", values.address.postalCode],
      ["Latitude", values.address.latitude], ["Longitude", values.address.longitude],
    ] },
    { title: ar ? "البيانات القانونية والعلامة" : "Legal & brand identity", rows: [
      ["Tax number", values.legal.taxNumber], ["VAT number", values.legal.vatNumber],
      ["Commercial registration", values.legal.commercialRegistrationNumber],
      ["Brand color", values.branding.primaryColor],
    ] },
    { title: ar ? "التفضيلات" : "Preferences", rows: [
      ["Timezone", values.preferences.timezone], ["Organization language", values.preferences.locale],
      ["Currency", values.preferences.currency], ["Date format", values.preferences.dateFormat],
      ["Week starts on", values.preferences.weekStartsOn], ["Supported languages", values.preferences.supportedLanguages.join(", ")],
    ] },
  ]
  const logo = values.branding.logoUrl
  return (
    <article className="tenant-pdf-document" dir={ar ? "rtl" : "ltr"}>
      <style>{`
        .tenant-pdf-document{display:none;color:#172033;font-family:Arial,sans-serif;background:#fff}
        @media print{
          @page{size:A4;margin:14mm}
          body *{visibility:hidden!important}
          .tenant-pdf-document,.tenant-pdf-document *{visibility:visible!important}
          .tenant-pdf-document{display:block!important;position:absolute!important;inset:0!important;width:100%!important;color:#172033!important}
          .tenant-pdf-document section{break-inside:avoid}
        }
      `}</style>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,borderBottom:"3px solid #6d4aff",paddingBottom:20,marginBottom:24}}>
        <div>
          <p style={{fontSize:10,fontWeight:700,letterSpacing:3,color:"#7656d6"}}>CUTILORA / PLATFORM</p>
          <h1 style={{fontSize:26,fontWeight:800,margin:"8px 0 4px"}}>{ar ? "ملف المؤسسة" : "Organization profile"}</h1>
          <p style={{fontSize:12,color:"#64748b"}}>{values.name}</p>
        </div>
        {logo && <img src={logo} alt="" style={{width:76,height:76,objectFit:"contain",borderRadius:12,border:"1px solid #e2e8f0",padding:6}}/>}
      </header>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
        <div style={{background:"#f5f3ff",padding:12,borderRadius:10}}><p style={{fontSize:9,color:"#64748b"}}>{ar ? "نوع الملف" : "Record type"}</p><p style={{fontSize:11,fontWeight:700,marginTop:4}}>{ar ? "مؤسسة عميلة" : "Tenant organization"}</p></div>
        <div style={{background:"#f5f3ff",padding:12,borderRadius:10}}><p style={{fontSize:9,color:"#64748b"}}>{ar ? "الرابط التعريفي" : "Slug"}</p><p style={{fontSize:11,fontWeight:700,marginTop:4}}>{slug || "—"}</p></div>
      </div>
      {groups.map((group) => {
        const rows = group.rows.filter(([, value]) => value.trim())
        if (!rows.length) return null
        return <section key={group.title} style={{marginBottom:18}}>
          <h2 style={{fontSize:13,fontWeight:800,color:"#5b43b5",paddingBottom:7,borderBottom:"1px solid #e2e8f0",marginBottom:8}}>{group.title}</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px 18px"}}>
            {rows.map(([label,value]) => <div key={label} style={{minWidth:0}}>
              <p style={{fontSize:9,color:"#64748b",marginBottom:3}}>{ar ? ({Country:"الدولة",Governorate:"المحافظة",City:"المدينة",District:"الحي",Address:"العنوان","Additional address":"تفاصيل إضافية",Building:"المبنى",Floor:"الدور",Unit:"الوحدة",Landmark:"علامة مميزة","Postal code":"الرمز البريدي",Latitude:"خط العرض",Longitude:"خط الطول"} as Record<string,string>)[label] ?? label : label}</p>
              <p style={{fontSize:11,fontWeight:600,overflowWrap:"anywhere",whiteSpace:"pre-wrap"}}>{value}</p>
            </div>)}
          </div>
        </section>
      })}
      <footer style={{borderTop:"1px solid #e2e8f0",paddingTop:12,marginTop:24,fontSize:9,color:"#94a3b8",display:"flex",justifyContent:"space-between"}}>
        <span>Cutilora · {ar ? "ملف المؤسسة" : "Organization record"}</span>
        <span>{new Date().toLocaleString(ar ? "ar-EG" : "en-US")}</span>
      </footer>
    </article>
  )
}
