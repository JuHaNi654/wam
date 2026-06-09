import Sidemenu from "./sidemenu"
import { cn } from "@/lib/utils"

type BaseProps = {
  showMenu?: boolean
  className?: string
  children: React.ReactNode
}
export default function Base({ showMenu, className, children }: BaseProps) {
  return (
    <div className="base-container">
      {showMenu && <Sidemenu />}
      <div className={cn(className, (showMenu ? "col-span-11" : "col-span-12"))}>
        {children}
      </div>
    </div>
  )
}
