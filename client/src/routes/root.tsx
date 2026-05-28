import { DialogContainer } from "@/components/dialog/dialog-container";
import { DialogProvider } from "@/context/dialog-context";
import { Outlet } from "react-router";

export default function Base() {
  return (
    <DialogProvider>
      <Outlet />
      <DialogContainer />
    </DialogProvider>
  )
}
