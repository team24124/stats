import { cn } from "@/lib/utils";
import { getAllTeamData, getTeamData } from "@/queries/getTeamData";
import type { Team } from "@/types/Team";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Combobox } from "./combobox";
import TeamMultiselector, { type Option } from "./team-multiselect";
import TeamStatDropdown from "./team-stat-dropdown";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./ui/chart";

function TeamBarChart({ passedOptions = [], className = "" }: { passedOptions?: Option[], className?: string }) {
    // Load Data
    const AllTeamsResponse = useSuspenseQuery(getAllTeamData);
    const DefaultTeamResponse = useSuspenseQuery(getTeamData('24124'));
    const DefaultTeam2Response = useSuspenseQuery(getTeamData('26145'));

    console.log(passedOptions.length <= 0)

    // Create selected teams state, and propagate with two default teams
    const DefaultOptions: Option[] = passedOptions.length <= 0 ? [{ value: "24124", team: DefaultTeamResponse.data }, { value: "26145", team: DefaultTeam2Response.data }] : passedOptions
    const [selected, setSelected] = useState<Option[]>(DefaultOptions);
    const [sortBy, setSortBy] = useState("team_number")

    const [statToggles, setStatToggles] = useState<{ epa_total: boolean, epa_auto: boolean, epa_tele: boolean, opr: boolean, opr_tele: boolean, opr_auto: boolean, opr_end: boolean }>({
        epa_total: true,
        epa_tele: true,
        epa_auto: true,
        opr: false,
        opr_tele: false,
        opr_auto: false,
        opr_end: false,
    })

    if (AllTeamsResponse.isError) return <main><div>An error occured.</div></main>


    const AllTeamData: Team[] = AllTeamsResponse.data

    // Create options from AllTeamData in the Option type format
    const TeamOptions: Option[] = AllTeamData.reduce((acc: Option[], team: Team) => {
        acc.push({ value: team.team_number.toString(), team: team })
        return acc
    }, [])

    type ChartData = { team_number: number, epa_total: number, epa_auto: number, epa_tele: number, opr: number, opr_auto: number, opr_tele: number, opr_end: number }

    const chartData = selected.reduce((acc: ChartData[], option: Option) => {
        acc.push({
            team_number: option.team.team_number,
            epa_total: option.team.epa_total,
            epa_auto: option.team.auto_epa_total,
            epa_tele: option.team.tele_epa_total,
            opr: option.team.opr,
            opr_auto: option.team.opr_auto,
            opr_tele: option.team.opr_tele,
            opr_end: option.team.opr_end
        })
        return acc
    }, [])


    const chartConfig = {
        24124: {
            label: "24124"
        },
        epa_total: {
            label: "EPA (Total)",
            color: "var(--chart-1)"
        },
        epa_auto: {
            label: "EPA (Auto)",
            color: "var(--chart-2)"
        },
        epa_tele: {
            label: "EPA (TeleOp)",
            color: "var(--chart-3)"
        },
        opr: {
            label: "OPR (Total)",
            color: "var(--chart-4)"
        },
        opr_auto: {
            label: "OPR (Auto)",
            color: "var(--chart-5)"
        },
        opr_tele: {
            label: "OPR (TeleOp)",
            color: "var(--chart-6)"
        },
        opr_end: {
            label: "OPR (Endgame)",
            color: "var(--chart-7)"
        },
    }

    const sortByOptions = chartData[0] ? Object.keys(chartData[0]).reduce((acc: { label: string, value: string }[], current: string) => {
        acc.push({ label: current, value: current })
        return acc;
    }, []) : []

    // Sort data by selected sort by value in descending order
    chartData.sort((a, b) => b[sortBy as keyof ChartData] - a[sortBy as keyof ChartData])

    return (
        <Card className={cn("p-4", className)}>
            <CardDescription>
                Compare Statistics Among Teams
            </CardDescription>
            <CardTitle>
                <TeamMultiselector
                    value={selected}
                    onChange={setSelected}
                    delay={10}
                    defaultOptions={TeamOptions}
                    emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">no results found.</p>}
                    className="mb-2"
                />
                <TeamStatDropdown
                    statToggles={statToggles}
                    setStatToggles={setStatToggles}
                />
                <span className="ml-4">Sort by: <Combobox values={sortByOptions} selected={sortBy} setSelected={setSortBy} allowEmpty={false} showSearchbar={false} /></span>
            </CardTitle>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: -16,
                            bottom: 16
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="team_number"
                            tickLine={true}
                            axisLine={true}
                            tickMargin={8}
                        />
                        <YAxis />
                        <ChartTooltip
                            content={<ChartTooltipContent labelKey={"epa_tele"} labelFormatter={(_value, payload) => `${payload[0].payload.team_number}`}/>}
                        />
                        <ChartLegend content={(props) => <ChartLegendContent payload={props.payload} />} />

                        {Object.keys(statToggles).map((stat) => statToggles[stat as keyof typeof statToggles] && <Bar dataKey={stat} fill={`var(--color-${stat})`} radius={4} />)}
                    </BarChart >
                </ChartContainer>

            </CardContent>
        </Card>
    );
}

export default TeamBarChart;