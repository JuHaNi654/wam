import Base from "@/components/base";
import Loading from "@/components/loading";
import Skills from "@/components/skills";
import WorkHistory from "@/components/workHistory";
import EducationList from "@/components/education";
import { GET, POST } from "@/lib/api";
import type { Skill, History, Profile, Education } from "@/types/api.types";
import { useQuery } from "@tanstack/react-query";

type Response = {
  profile: Profile;
  skills: Skill[];
  history: History[];
  education: Education[];
}

export default function Profile() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return await GET<Response>('/api/profile', null)
    },
    retry: 0,
  })

  const saveSkills = async (skills: Skill[]) => {
    try {
      await POST<any>("/api/profile/skills", { skills })
    } catch (err) {
      console.log("Something went wrong while trying to save profile skills")
      console.log(err)
    }
  }

  return (
    <Base className="flex flex-col gap-4" showMenu>
      <header className="py-4 font-semibold">
        <h1 className="text-4xl">Profile</h1>
      </header>
      <Loading isLoading={isLoading}>
        <div className="flex flex-col gap-6">

          <div className="flex flex-col gap-2 border rounded-lg border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground 
            uppercase tracking-wide">
              Skills
            </h3>
            <Skills skills={data?.data.skills || []} update={saveSkills} />
          </div>

          <EducationList data={data?.data.education || []} />
          <WorkHistory data={data?.data.history || []} />
        </div>
      </Loading>
    </Base>
  )
}
