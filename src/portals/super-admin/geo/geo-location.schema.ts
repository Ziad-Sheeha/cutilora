import * as Yup from "yup"

export const geoLocationSchema = (
  kind: "countries" | "governorates" | "cities" | "districts",
  messages: {
    nameRequired: string
    codeRequired: string
    codeInvalid: string
    parentRequired: string
  },
) =>
  Yup.object({
    name_en: Yup.string().trim().required(messages.nameRequired).max(150),
    name_ar: Yup.string().trim().required(messages.nameRequired).max(150),
    ...(kind === "countries"
      ? {
          code: Yup.string()
            .transform((value: unknown) =>
              typeof value === "string" ? value.trim().toUpperCase() : value,
            )
            .required(messages.codeRequired)
            .matches(/^[A-Z]{2}$/, messages.codeInvalid),
        }
      : {}),
    ...(kind !== "countries"
      ? { parentId: Yup.string().required(messages.parentRequired) }
      : {}),
  })
