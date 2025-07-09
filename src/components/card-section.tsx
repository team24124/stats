import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CountUp from 'react-countup';

type Props = {
    numTeams: number,
    numEvents: number
}

function CardSection({ numTeams, numEvents }: Props) {
    return (
        <div className='grid grid-cols-1 grid-rows-2 gap-8 m-4 w-md sm:grid-cols-2 sm:w-xl md:w-3xl md:grid-rows-1'>
            <Card>
                <CardHeader>
                    <CardDescription>Tracking statistics for...</CardDescription>
                    <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
                        <CountUp end={numTeams} delay={0.5}/> Teams
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>Analyzing data from...</CardDescription>
                    <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
                        <CountUp end={numEvents} delay={0.5}/> Events
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}

export default CardSection