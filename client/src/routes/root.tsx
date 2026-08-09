import { DialogContainer } from "@/components/dialog/dialog-container";
import { Outlet } from "react-router";

export default function Base() {
  return (
    <>
      <Outlet />
      <DialogContainer />
    </>
  )
}
