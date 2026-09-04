import { createRoute } from "@tanstack/solid-router"
import Layout from "./layouts/base"
import type { TEducation, TProfile, TSkill, TWorkHistory } from "../models/models"
import { GET } from "../utils/api"
import ToggleEdit from "../components/toggle-edit"
import Education from "../components/education"
import WorkHistory from "../components/work-history"
import PageHeading from "../components/page-heading"


type Response = {
  profile: TProfile;
  skills: Array<TSkill>;
  history: Array<TWorkHistory>;
  education: Array<TEducation>;
}

const profileRoute = createRoute({
  getParentRoute: () => Layout,
  path: 'profile',
  component: Profile,
  loader: () => GET<Response>("/profile", null)
})

function Profile() {
  const profile = profileRoute.useLoaderData()
  console.log(profile())

  return (
    <div class="flex flex-col gap-4">
      <PageHeading title="Profile" />
      <ToggleEdit handleSave={() => { }} label="Introduction" text={profile().response?.data?.profile.introduction} />
      <Education data={profile().response?.data?.education || []} />
      <WorkHistory data={profile().response?.data?.history || []} />
    </div>
  )
}

export default profileRoute
