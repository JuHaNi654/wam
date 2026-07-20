import Base from "@/components/base";
import Loading from "@/components/loading";
import Skills from "@/components/skills";
import WorkHistory from "@/components/workHistory";
import EducationList from "@/components/education";
import Introduction from "@/components/introduction";
import { GET, POST } from "@/lib/api";
import type { Skill, Profile, Education } from "@/types/api.types";
import { useQuery } from "@tanstack/react-query";
import type { SavedWorkHistory } from "@/components/form/history";
import { toast } from "sonner"

type Response = {
  profile: Profile;
  skills: Skill[];
  history: SavedWorkHistory[];
  education: Education[];
}

export default function Profile() {
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const result = await GET<Response>(`/api/profile`, null)
      if (result.error) throw result.error
      return result.response!.data
    },
  })

  if (isLoading) return <Loading isLoading={isLoading} />
  if (!isSuccess || !data) return null

  const saveSkills = async (skills: Skill[]) => {
    const { error } = await POST<any>("/api/profile/skills", { skills })
    if (error) {
      console.error(error)
      toast.error("Something went wrong while trying to update skills", { position: "bottom-right" })
    }
  }

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">Profile</h1>
      </header>

      <div className="flex flex-col gap-6">
        <Introduction introduction={data!.profile.introduction} />

        <div className="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground 
          uppercase tracking-wide">
            Skills
          </h3>
          <Skills skills={data!.skills || []} update={saveSkills} />
        </div>

        <EducationList data={data!.education || []} />
        <WorkHistory data={data!.history || []} />
      </div>
    </Base>
  )
}
