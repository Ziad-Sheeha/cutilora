import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
type Props = { children: ReactNode }
type State = { hasError: boolean }
export class AppErrorBoundary extends Component<Props,State> {
  state:State={hasError:false}
  static getDerivedStateFromError():State{return {hasError:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error("UI render error",error,info)}
  render(){if(this.state.hasError)return <main className="grid min-h-svh place-items-center p-6"><div className="max-w-md text-center"><AlertTriangle className="mx-auto size-10 text-error"/><h1 className="mt-4 text-xl font-bold">Something went wrong</h1><p className="mt-2 text-sm text-muted-foreground">The page could not be rendered. Your work may not have been saved.</p><Button className="mt-5" onClick={()=>this.setState({hasError:false})}><RefreshCw className="me-2 size-4"/>Try again</Button></div></main>;return this.props.children}
}
