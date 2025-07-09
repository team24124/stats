import type { Team } from "@/types/Team";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import CountUp from "react-countup";
import CardCopyAction from "./card-copy-action";

function OPRCard({ team }: { team: Team }) {
    const oprLastEvent = team.historical_opr[Math.max(team.historical_opr.length - 2, 0)] // Get the last (or very first) event
    const oprCurrent = team.opr
    const changeInOPR = oprCurrent - oprLastEvent

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>OPR (Total)</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"><CountUp end={team.opr} decimals={2} /></CardTitle>
                <CardAction>
                    <Badge variant="outline">
                        {changeInOPR > 0 ?
                            <>
                                <IconTrendingUp className="text-green-500" /> <div className="text-green-500">+{changeInOPR.toFixed(2)}</div>
                            </> :
                            changeInOPR < 0 ?
                                <>
                                    <IconTrendingDown className="text-red-500" /> <div className="text-red-500">{changeInOPR.toFixed(2)} </div>
                                </> :
                                <>
                                    <IconTrendingUp /> <div>{changeInOPR.toFixed(2)} </div>
                                </>
                        }
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {changeInOPR > 0 ? <>Improvement between events <IconTrendingUp className="size-4" /></> : changeInOPR < 0 ? <>Regression between events <IconTrendingDown className="size-4" /></> : <>No change between events.</>}
                </div>
                <div className="text-muted-foreground">
                    OPR compared to last event.
                </div>
            </CardFooter>
        </Card>
    );
}

export function OPRValuesCard({ team }: { team: Team }) {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>Raw OPR Data</CardDescription>
                <CardCopyAction text={`${team.opr}, ${team.opr_auto}, ${team.opr_tele}, ${team.opr_end}`} />
            </CardHeader>
            <CardContent className="grid grid-cols-2 grid-rows-2 gap-y-8">
                <div className="flex flex-col">
                    <label className="font-semibold">Total</label>
                    <label>{team.opr.toFixed(2)}</label>
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold">Auto</label>
                    <label>{team.opr_auto.toFixed(2)}</label>
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold">TeleOp</label>
                    <label>{team.opr_tele.toFixed(2)}</label>
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold">Endgame</label>
                    <label>{team.opr_end.toFixed(2)}</label>
                </div>
            </CardContent>
        </Card>
    );
}

export default OPRCard;