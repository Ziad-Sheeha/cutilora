import * as Yup from "yup"

const latinOnly = /^[\p{Script=Latin}\p{M}\d\s.,:'’()&+\x2d]*$/u
const arabicOnly = /^[\p{Script=Arabic}\p{M}\d\s،؛؟.,:'’()&+ـ\x2d]*$/u

/** Reusable schemas for language-specific text fields across all product forms. */
export function englishTextSchema(message: string) {
  return Yup.string().trim().test("english-only", message, (value) => !value || latinOnly.test(value))
}

export function arabicTextSchema(message: string) {
  return Yup.string().trim().test("arabic-only", message, (value) => !value || arabicOnly.test(value))
}

export function isEnglishText(value: string): boolean {
  return latinOnly.test(value)
}

export function isArabicText(value: string): boolean {
  return arabicOnly.test(value)
}
