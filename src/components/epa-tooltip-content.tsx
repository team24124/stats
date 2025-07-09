import type { ChartData } from "./epa-area-chart"

type Props = {
    active: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any[],
    label: string | number | undefined
}

function parseMatchInfo(match: string) {
    const qSplit = match.lastIndexOf('q') // Index of q to split at

    const season = match.substring(0, 4)
    const event_code = match.substring(4, qSplit)
    const match_number = match.substring(qSplit + 1)

    return { season, event_code, match_number }
}

export function EPATooltipContent({ active, payload, label, chartData }: Props & { chartData: ChartData }) {
    const isVisible = active && payload && payload.length;

    if (!isVisible) return;

    const matchName = payload[0].payload.match_name;
    const isStartingMatch = matchName === 'START' // True if the match is the element that is the starting average

    const { event_code, match_number } = parseMatchInfo(matchName)

    const prevEPA = chartData[Math.max(0, parseInt(payload[0].payload.match) - 1)].epa
    const currentEPA = payload[0].value;
    const changeInEPA = currentEPA - prevEPA

    return (
        <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
            {isVisible && (
                !isStartingMatch ?
                    <>
                        <div className="font-bold">{event_code} Qualification #{match_number}</div>
                        <div className="text-muted-foreground">{label} Matches Played</div>
                        <div>
                            <label className="font-semibold">EPA</label> {currentEPA.toFixed(2)} ({changeInEPA >= 0 ? <span className="text-green-500">+{changeInEPA.toFixed(2)}</span> : <span className="text-red-500">{changeInEPA.toFixed(2)}</span>})
                        </div>
                    </> :
                    <>
                        <div className="font-semibold">Starting Average</div>
                        <div>This value is the starting average for all teams in the world.</div>
                        <div><label className="font-semibold">EPA</label> {currentEPA.toFixed(2)}</div>
                    </>
            )}
        </div>
    );
}

export function ComponentEPATooltipContent({ active, payload, label }: Props) {
    const isVisible = active && payload && payload.length;

    if (!isVisible) return;

    const matchName = payload[0].payload.match_name;
    const isStartingMatch = matchName === 'START' // True if the match is the element that is the starting average
    const { event_code, match_number } = parseMatchInfo(matchName)

    return (
        <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
            {isVisible && (
                !isStartingMatch ?
                    <>
                        <div className="font-bold">{event_code} Qualification #{match_number}</div>
                        <div className="text-muted-foreground">{label} Matches Played</div>
                        <div><label className="text-[var(--color-tele_epa)] font-semibold">TeleOp</label> {payload[0].payload.tele_epa.toFixed(2)}</div>
                        <div><label className="text-[var(--color-end_epa)] font-semibold">Endgame</label> {payload[0].payload.end_epa.toFixed(2)}</div>
                        <div><label className="text-[var(--color-auto_epa)] font-semibold">Auto</label> {payload[0].payload.auto_epa.toFixed(2)}</div>
                        <div><label className="font-semibold">Total</label> {payload[0].payload.epa.toFixed(2)}</div>
                    </> :
                    <>
                        <div className="font-semibold">Starting Average</div>
                        <div>This value is the starting average for all teams in the world.</div>
                        <div>EPA {payload[0].value.toFixed(2)}</div>
                    </>
            )}
        </div>
    );
}

export default EPATooltipContent