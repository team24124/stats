import LinkSection from '@/components/link-section'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { IconLink } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  pendingComponent: () => <Loading />,
  component: Index,
})

function Index() {

  return (
    <main>
      <h1>Nigthawks Robotics Statistics</h1>
      <p>Welcome to the Nighthawks Robotics statistics dashboard. Providing up-to-date OPR and EPA statistics calulcations and visualization for FIRST Tech Challenge teams. Data is updated approximately one day after an event concludes.</p>
      <p>View individual team statistics or compare teams using the buttons below.</p>
      <LinkSection />

      <h2 className='pt-16'>The EPA Model</h2>
      <p>The Expected Points Added (EPA) Model was originally developed by <a href='https://www.statbotics.io/blog/intro'>Statbotics</a> for use in the FIRST Robotics Competition (FRC). Nighthawks Robotics is in the process of adapting the model into a predictive measure for FIRST Tech Challenge teams. Currently, EPA can provide a running average of a team's performance throughout the season and in comparison to other teams.</p>
      <Button className="cursor-pointer ml-4 bg-secondary-foreground text-secondary"><a href='https://www.statbotics.io/blog/intro'>Learn More about EPA</a><IconLink /></Button>

      <h2 className='pt-16'>Modifications and Adaptation for Competition</h2>
      <p>Nighthawks Robotics has made a number of adaptations to the original EPA model.
        The defensive Margin (M) parameter is disregarded in our calculations to give a more accurate measure of a team's offensive capability as opposed to likelihood of winning.
        Calculations only take into account qualification matches from league meets/tournaments, super/regional qualifiers, championships, and premier events in order to more fairly compare teams. 
      </p>
    </main>
  )
}