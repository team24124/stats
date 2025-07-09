import CardSection from '@/components/card-section'
import { DataTable } from '@/components/data-table'
import Loading from '@/components/loading'
import { columns } from '@/components/team-data-columns'
import TeamSearchbar from '@/components/team-search'
import { getEventData } from '@/queries/getEventData'
import { getAllTeamData } from '@/queries/getTeamData'
import type { Event } from '@/types/Event'
import type { Team } from '@/types/Team'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/teams/')({
  loader: async ({ context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData(getAllTeamData),
      queryClient.ensureQueryData(getEventData)
    ])
  },
  pendingComponent: () => <Loading />,
  component: Page,
})


export default function Page() {
  const navigate = useNavigate({ from: '/teams' })

  const TeamResponse = useSuspenseQuery(getAllTeamData);
  const EventResponse = useSuspenseQuery(getEventData);
  
  if(EventResponse.isError) return <p>An error has occured. Please try again</p>
  if(TeamResponse.isError) return <p>An error has occured. Please try again</p>

  const TeamData: Team[] = TeamResponse.data
  const EventData: Event[] = EventResponse.data


  const handleSearch = (value: string) => {
    navigate({ to: `/teams/${value}` })
  }


  return (
    <main >
      <h1>View Teams</h1>
      <p>Use the searchbar below to view individual team statistics.</p>
      <div className='max-w-4xl lg:max-w-7xl'>
        <div className='flex flex-col items-center'>
          <CardSection numTeams={TeamData.length} numEvents={EventData.length} />
        </div>
        
        <div className='pt-16 flex flex-col items-center'>
          <TeamSearchbar onSelected={handleSearch} items={TeamData} />
        </div>



        <h2 className='pt-16'>View data for all Teams</h2>
        <p>Use the data table below to filter and search for teams and compare raw data. Toggle column visibility using the <b>Columns</b> button. Use the <b>Compare Selected Teams</b> button to visualize the selected teams data.</p>
        <div className='flex flex-col items-center'>
          <DataTable columns={columns} data={TeamData} />
        </div>
      </div>
    </main>
  )
}
