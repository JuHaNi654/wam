import { createRoute } from "@tanstack/solid-router"
import Layout from "./layouts/base"
import type { TProfile, TSavedEducation, TSavedWorkHistory, TSkill } from "../models/models"
import { GET, POST, PUT } from "../utils/api"
import ToggleEdit from "../components/toggle-edit"
import Education from "../components/education"
import WorkHistory from "../components/work-history"
import PageHeading from "../components/page-heading"
import Tags from "../components/skills"


type Response = {
  profile: TProfile;
  skills: Array<TSkill>;
  history: Array<TSavedWorkHistory>;
  education: Array<TSavedEducation>;
}

const profileRoute = createRoute({
  getParentRoute: () => Layout,
  path: 'profile',
  component: Profile,
  loader: () => GET<Response>("/profile", null)
})

function Profile() {
  const profile = profileRoute.useLoaderData()

  const updateTags = async (tags: Array<TSkill>) => {
    const { error } = await POST('/profile/skills', { skills: tags })
    if (error) {
      console.error("failed to update skills listing:")
      console.error(error)
    }
  }

  const handleSave = async (item: { [k: string]: any }) => {
    const { error } = await PUT('/profile', item)
    if (error) {
      console.error("Error occured while updating profile")
      console.error(error)
    }
  }

  return (
    <div class="flex flex-col gap-4">
      <PageHeading title="Profile" />
      <ToggleEdit name="introduction" handleSave={handleSave} label="Introduction" text={profile().response?.data?.profile.introduction} />
      <Tags data={profile().response?.data?.skills || []} onUpdate={updateTags} />
      <Education data={profile().response?.data?.education || []} />
      <WorkHistory data={profile().response?.data?.history || []} />
    </div>
  )
}

export default profileRoute
