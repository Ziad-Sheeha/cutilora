import * as Yup from "yup"
export const geoLocationSchema = (kind: "countries" | "governorates" | "cities" | "districts", messages: { nameRequired: string; codeRequired: string; parentRequired: string }) => Yup.object({
 name: Yup.string().trim().required(messages.nameRequired).max(150),
 ...(kind === "countries" ? { code: Yup.string().trim().required(messages.codeRequired).max(10) } : {}),
 ...(kind !== "countries" ? { parentId: Yup.string().required(messages.parentRequired) } : {}),
})
