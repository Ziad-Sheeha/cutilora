import { Link } from "react-router"
export function NotFoundPage() {
  return <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center"><p className="text-sm font-semibold text-primary">404 · Page not found</p><h1 className="mt-3 text-3xl font-bold">This page doesn’t exist.</h1><p className="mt-3 text-sm text-muted-foreground">The link may be incorrect or the page may have moved.</p><Link to="/" className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">Back to home</Link></main>
}
