import { cn, getRandomColor } from "@/lib/utils";
import { getAllTeamData, getTeamData } from "@/queries/getTeamData";
import type { Team } from "@/types/Team";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Combobox } from "./combobox";
import TeamMultiselector, { type Option } from "./team-multiselect";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";

function EPALineChart({ passedOptions = [], className = "" }: { passedOptions?: Option[], className?: string }) {
    // Load Data
    const AllTeamsResponse = useSuspenseQuery(getAllTeamData);
    const DefaultTeamResponse = useSuspenseQuery(getTeamData('24124'));
    const DefaultTeam2Response = useSuspenseQuery(getTeamData('26145'));

    // Create selected teams state, and propagate with two default teams
    const DefaultOptions: Option[] = passedOptions.length <= 0 ? [{ value: "24124", team: DefaultTeamResponse.data }, { value: "26145", team: DefaultTeam2Response.data }] : passedOptions
    const [selected, setSelected] = useState<Option[]>(DefaultOptions);
    const colorMapRef = useRef<{ [key: string]: string }>({});

    const [selectedMode, setSelectedMode] = useState("historical_epa")
    const ModeOptions = [
        { value: 'historical_epa', label: 'EPA (Total)' },
        { value: 'historical_auto_epa', label: 'EPA (Auto)' },
        { value: 'historical_tele_epa', label: 'EPA (TeleOp)' },
    ]

    // Assign random but persistent color to each value
    const colorMap = useMemo(() => {
        selected.forEach((key) => {
            if (!colorMapRef.current[key.value]) {
                colorMapRef.current[key.value] = getRandomColor();
            }
        });
        return colorMapRef.current;
    }, [selected]);




    if (AllTeamsResponse.isError) return <main><div>An error occured.</div></main>
    const AllTeamData: Team[] = AllTeamsResponse.data

    // Create options from AllTeamData in the Option type format
    const TeamOptions: Option[] = AllTeamData.reduce((acc: Option[], team: Team) => {
        acc.push({ value: team.team_number.toString(), team: team })
        return acc
    }, [])


    const maxLength = Math.max(...selected.map((option) => getDataFromMode(option.team, selectedMode).length))


    const chartData: Record<string, number | null>[] = Array.from({ length: maxLength }).map((_, index) => {
        const row: Record<string, number | null> = { match: index };
        selected.forEach((option: Option) => {
            row[option.value] = getDataFromMode(option.team, selectedMode)[index] ?? null;
        })
        return row;
    })



    const chartConfig = selected.reduce((acc: ChartConfig, option) => {
        acc[option.value] = { label: option.value, color: `${colorMap[option.value]}` }
        return acc
    }, { match: { label: "Match" } })


    return (
        <Card className={cn("p-4", className)}>
            <CardDescription>
                Compare Historical EPA
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
                <Combobox values={ModeOptions} selected={selectedMode} setSelected={setSelectedMode} allowEmpty={false} showSearchbar={false} />
            </CardTitle>
            <CardContent >
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: -16,
                            bottom: 16
                        }}
                        
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="match"
                            label={{ value: 'Matches Played', position: 'bottom' }}
                            tickLine={true}
                            axisLine={true}
                            tickMargin={8}
                        />
                        <YAxis />
                        <ChartTooltip
                            content={<ChartTooltipContent labelKey="match" labelFormatter={(_value, payload) => `Matches Played: ${payload[0].payload.match}`} />}
                        />
                        {selected.map((option) => (
                            <Line
                                dataKey={option.value}
                                type="natural"
                                stroke={`var(--color-${option.value})`}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function getDataFromMode(team: Team, mode: string) {
    switch (mode) {
        case "historical_auto_epa":
            return team.historical_auto_epa
        case "historical_tele_epa":
            return team.historical_tele_epa
        default:
        case "historical_epa":
            return team.historical_epa
    }
}

export default EPALineChart;