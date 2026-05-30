import { useNavigate } from "react-router";
import Base from "@/components/base";
import ApplicationForm, { type SavedApplication } from "@/components/form/application";

export default function NewJobRoute() {
  const navigate = useNavigate();

  const handleSave = async (data: SavedApplication) => {
    navigate(`/application/${data.id}`);
  }

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">New Job Application</h1>
      </header>
      <div className="border border-gray-200 rounded-lg p-4">
        <ApplicationForm onSuccess={handleSave} />
      </div>
    </Base>
  )
}
