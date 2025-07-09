import EPAAreaChart from '@/components/epa-area-chart';
import EPABreakdownChart from '@/components/epa-breakdown-chart';
import EPACard, { EPAValuesCard } from '@/components/epa-card';
import MatchesCard from '@/components/games-played-card';
import Loading from '@/components/loading';
import OPRCard, { OPRValuesCard } from '@/components/opr-card';
import TeamSearchbar from '@/components/team-search';
import { Button } from '@/components/ui/button';
import Flag from '@/components/ui/flag';
import { getAllTeamData, getTeamData } from '@/queries/getTeamData';
import type { Team } from '@/types/Team';
import { IconLink } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/teams/$teamNumber')({
  loader: ({ context: { queryClient }, params }) => queryClient.ensureQueryData(getTeamData(params.teamNumber)),
  component: RouteComponent,
  pendingComponent: () => <Loading />
})

function RouteComponent() {
  const { teamNumber } = Route.useParams()

  // Get all team data for search bar
  const AllTeamsResponse = useSuspenseQuery(getAllTeamData);
  const AllTeamData: Team[] = AllTeamsResponse.data

  // Get individual team data for display
  const TeamResponse = useSuspenseQuery(getTeamData(teamNumber));
  const team: Team = TeamResponse.data
  const navigate = useNavigate()
  

  const handleSearch = (value: string) => {
    navigate({ to: `/teams/${value}` })
  }

  return <main>
    <TeamSearchbar onSelected={handleSearch} items={AllTeamData}/>

    <div className='pt-8 flex items-center'>
      <Flag countryName={team.country} />
      <h1>{team.team_name}</h1>
    </div>
    <h2 className='mt-0'>{team.team_number}</h2>
    <p>{team.country}, {team.state_province}, {team.city}</p>
    <div className='m-4'>
      <a href={`https://ftc-events.firstinspires.org/2024/team/${team.team_number}`} target="_blank"><Button className="cursor-pointer">View on FTC Events<IconLink /></Button></a>
      <a href={`https://ftcscout.org/teams/${team.team_number}`} target="_blank" className='ml-2'><Button className="cursor-pointer">View on FTCScout<IconLink /></Button></a>
    </div>

    
    <div className='grid grid-cols-1 grid-rows-5 lg:grid-cols-3 lg:grid-rows-5 gap-4'>
      <EPACard team={team}/>
      <OPRCard team={team}/>
      <MatchesCard team={team}/>
      <EPABreakdownChart team={team}/>
      <EPAValuesCard team={team} />
      <OPRValuesCard team={team} />
      <EPAAreaChart team={team} />
    </div>

    <a href='https://frc-events.firstinspires.org/services/API'><i><p className='text-muted-foreground'>Event Data provided by FIRST</p></i></a>

  </main>
}
