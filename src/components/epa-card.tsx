import type { Team } from "@/types/Team";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import CountUp from "react-countup";
import CardCopyAction from "./card-copy-action";
import { Badge } from "./ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

function EPACard({ team }: { team: Team }) {
    const epaFiveGamesBefore = team.historical_epa[Math.max(team.historical_epa.length - 6, 0)] // Get the EPA value from 5 games ago (or the first game)
    const epaCurrent = team.epa_total
    const changeInEpa = epaCurrent - epaFiveGamesBefore


    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>EPA (Total)</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"><CountUp end={team.epa_total} decimals={2} /></CardTitle>
                <CardAction>
                    <Badge variant="outline">
                        {changeInEpa > 0 ?
                            <>
                                <IconTrendingUp className="text-green-500" /> <div className="text-green-500">+{changeInEpa.toFixed(2)}</div>
                            </> :
                            changeInEpa < 0 ?
                                <>
                                    <IconTrendingDown className="text-red-500" /> <div className="text-red-500">{changeInEpa.toFixed(2)} </div>
                                </> :
                                <>
                                    <IconTrendingUp /> <div>{changeInEpa.toFixed(2)} </div>
                                </>}
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {changeInEpa > 0 ? <>Trending up <IconTrendingUp className="size-4" /></> : changeInEpa < 0 ? <>Trending down <IconTrendingDown className="size-4" /></> : <>No change in EPA</>}
                </div>
                <div className="text-muted-foreground">
                    EPA compared to five games prior.
                </div>
            </CardFooter>
        </Card>
    );
}

export function EPAValuesCard({ team }: { team: Team }) {
    const end_epa_total = team.epa_total - team.auto_epa_total - team.tele_epa_total

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>Raw EPA Data</CardDescription>
                <CardCopyAction text={`${team.epa_total}, ${team.auto_epa_total}, ${team.tele_epa_total}, ${end_epa_total}`} />
            </CardHeader>
            <CardContent className="grid grid-cols-2 grid-rows-2 gap-y-8">
                <div className="flex flex-col">
                    <label className="font-semibold">Total</label>
                    <label>{team.epa_total.toFixed(2)}</label>
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold">Auto</label>
                    <label>{team.auto_epa_total.toFixed(2)}</label>
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold">TeleOp</label>
                    <label>{team.tele_epa_total.toFixed(2)}</label>
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold">Endgame</label>
                    <label>{end_epa_total.toFixed(2)}</label>
                </div>
            </CardContent>
        </Card>
    );
}

export default EPACard;