import LinkSection from '@/components/link-section'
import Loading from '@/components/loading'
import { createFileRoute } from '@tanstack/react-router'
import { getAllTeamData } from '@/queries/getTeamData'
import { getEventData } from '@/queries/getEventData'
import CardSection from '@/components/card-section'
import { useSuspenseQuery } from '@tanstack/react-query'
import ExampleEPALineChart from '@/components/example-epa-line-chart'
import EPAInfo from '@/components/epa-info'

export const Route = createFileRoute('/')({
    loader: async ({ context: { queryClient } }) => {
        return Promise.all([
          queryClient.ensureQueryData(getAllTeamData),
        ])
      },
  pendingComponent: () => <Loading />,
  component: Index,
})

function Index() {
  const TeamResponse = useSuspenseQuery(getAllTeamData);
  const EventResponse = useSuspenseQuery(getEventData);

  if (EventResponse.isError) return <p>An error has occured. Please try again</p>
  if (TeamResponse.isError) return <p>An error has occured. Please try again</p>

  const TeamData: Team[] = TeamResponse.data
  const EventData: Event[] = EventResponse.data

  const selectedTeamOptions = TeamData.sort((a,b) => {return b.epa_total - a.epa_total})
  .slice(0,4)
  .reduce((acc: Option[], current) => {
    acc.push({ 'value': current.team_number.toString(), 'team': current})
    return acc
  }, [])




  return (
    <main>
        <div className='flex flex-col items-center'>
          <p className='text-7xl font-bold'>NEST</p>
          <h2>Nighthawks Event Statistics Tool</h2>

          <CardSection numTeams={TeamData.length} numEvents={EventData.length} />
        </div>

        <h1>EPA Comparison</h1>
        <ExampleEPALineChart passedOptions={selectedTeamOptions} className='mt-8 m-4' />

        <h2>About EPA</h2>
        <div className="m-[20px]">
            <EPAInfo/>
        </div>

        <LinkSection/>
    </main>
  )
}