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
            .trim()
            .required(messages.codeRequired)
            .matches(/^[A-Za-z]{2,3}$/, messages.codeInvalid),
        }
      : {}),
    ...(kind !== "countries"
      ? { parentId: Yup.string().required(messages.parentRequired) }
      : {}),
  })
