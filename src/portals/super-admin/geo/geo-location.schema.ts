import * as Yup from "yup"
import { arabicTextSchema, englishTextSchema } from "@/shared/validation/language-validation"

export const geoLocationSchema = (
  kind: "countries" | "governorates" | "cities" | "districts",
  messages: {
    nameRequired: string
    nameEnInvalid: string
    nameArInvalid: string
    codeRequired: string
    codeInvalid: string
    parentRequired: string
  },
) =>
  Yup.object({
    name_en: englishTextSchema(messages.nameEnInvalid).required(messages.nameRequired).max(150),
    name_ar: arabicTextSchema(messages.nameArInvalid).required(messages.nameRequired).max(150),
    ...(kind === "countries"
      ? { code: Yup.string().transform((value: unknown) => typeof value === "string" ? value.trim().toUpperCase() : value).required(messages.codeRequired).matches(/^[A-Z]{2}$/, messages.codeInvalid) }
      : {}),
    ...(kind !== "countries"
      ? { parentId: Yup.string().required(messages.parentRequired) }
      : {}),
  })
