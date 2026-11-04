import * as Yup from "yup"

const ARABIC_LETTERS = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u
const LATIN_LETTERS = /[A-Za-z\u00C0-\u024F]/u

/** Reusable field-level language guards for every Formik/Yup form. */
export const englishTextSchema = (message: string) =>
  Yup.string().test("english-only", message, (value) => !value || !ARABIC_LETTERS.test(value))

export const arabicTextSchema = (message: string) =>
  Yup.string().test("arabic-only", message, (value) => !value || !LATIN_LETTERS.test(value))

/** For identifiers such as email addresses: allow normal symbols, reject Arabic script. */
export const latinInputSchema = (message: string) =>
  Yup.string().test("latin-input", message, (value) => !value || !ARABIC_LETTERS.test(value))

/** Runtime checks for controlled forms that do not use Formik. */
export const isEnglishText = (value: string) => !ARABIC_LETTERS.test(value)
export const isArabicText = (value: string) => !LATIN_LETTERS.test(value)
