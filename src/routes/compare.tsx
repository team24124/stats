import EPALineChart from '@/components/epa-line-chart';
import Loading from '@/components/loading';
import TeamBarChart from '@/components/team-bar-chart';
import { type Option } from "@/components/team-multiselect";
import { getEventData } from '@/queries/getEventData';
import { getAllTeamData, getTeamData } from '@/queries/getTeamData';
import { createFileRoute, useRouterState } from '@tanstack/react-router';

export const Route = createFileRoute('/compare')({
  loader: async ({ context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData(getAllTeamData),
      queryClient.ensureQueryData(getEventData),

      // Load two default teams for each chart
      queryClient.ensureQueryData(getTeamData("24124")),
      queryClient.ensureQueryData(getTeamData("26145"))
    ])
  },
  pendingComponent: () => <Loading />,
  component: Compare,
})


function Compare() {
  const state = useRouterState({ select: s => s.location.state });
  const selectedTeamOptions = state.teams?.reduce((acc: Option[], current) => {
    acc.push({ 'value': current.team_number.toString(), 'team': current})
    return acc
  }, [])

  return <main>
    <h1>Compare Teams</h1>
    <p>Use the team searchbar in each chart module to find teams to compare. Customize the visualization using the settings shown below the searchbar.</p>
    <EPALineChart passedOptions={selectedTeamOptions} className='mt-8 m-4' />
    <TeamBarChart passedOptions={selectedTeamOptions} className='mt-8 m-4' />
  </main>
}