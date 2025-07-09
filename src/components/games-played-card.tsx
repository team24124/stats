import type { Team } from "@/types/Team";
import CountUp from "react-countup";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

function MatchesCard({ team }: { team: Team }) {
    const gamesPlayed = team.games_played - 1 // Subtract one to account for EPA starting average
    const eventsPlayed = team.historical_opr.length

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>Qualification Matches Played</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"><CountUp end={gamesPlayed} /></CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    Across {eventsPlayed} events.
                </div>
                <div className="text-muted-foreground">
                    Average of ~{Math.floor(gamesPlayed / eventsPlayed)} qualification games played per event.
                </div>
            </CardFooter>
        </Card>
    );
}

export default MatchesCard;