import axios from "axios"
import { appEnv } from "@/config/env"

export const apiClient = axios.create({
  baseURL: appEnv.apiBaseUrl,
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})
