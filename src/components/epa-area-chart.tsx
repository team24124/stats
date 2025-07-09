import type { Team } from "@/types/Team";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import EPATooltipContent, { ComponentEPATooltipContent } from "./epa-tooltip-content";
import { Badge } from "./ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, type ChartConfig } from "./ui/chart";
import { Switch } from "./ui/switch";

export type ChartData = { match: number; match_name: string; epa: number; auto_epa: number; tele_epa: number; end_epa: number }[]

function EPAAreaChart({ team }: { team: Team }) {
    const chartData: ChartData = []
    const [isViewComponents, setIsViewComponents] = useState(false)

    for (let match = 0; match < team.games_played; match++) {
        chartData.push({
            match: match,
            match_name: team.matches[match],
            epa: team.historical_epa[match],
            auto_epa: team.historical_auto_epa[match],
            tele_epa: team.historical_tele_epa[match],
            end_epa: team.historical_epa[match] - team.historical_auto_epa[match] - team.historical_tele_epa[match]
        })
    }

    const totalEpaChartConfig = {
        epa: {
            label: "EPA (Total)",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig

    const componentEpaChartConfig = {
        auto_epa: {
            label: "EPA (Auto)",
            color: "var(--chart-1)",
        },
        tele_epa: {
            label: "EPA (TeleOp)",
            color: "var(--chart-2)",
        },
        end_epa: {
            label: "EPA (Endgame)",
            color: "var(--chart-3)",
        },
    } satisfies ChartConfig

    return (
        <Card className='lg:col-span-3 row-span-2'>
            <CardHeader>
                <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-3xl">Historical EPA</CardTitle>
                <CardDescription>{!isViewComponents ? "Total EPA shown over time" : "EPA components shown over time"}</CardDescription>
                <CardAction>
                    <Badge variant={"outline"} className="p-2">
                        View Score Components
                        <Switch checked={isViewComponents} onCheckedChange={setIsViewComponents} />
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                {!isViewComponents ?
                    <TotalEPAChart chartData={chartData} chartConfig={totalEpaChartConfig} />
                    :
                    <ComponentEPAChart chartData={chartData} chartConfig={componentEpaChartConfig} />
                }
            </CardContent>
        </Card>
    );
}

function TotalEPAChart({ chartData, chartConfig }: { chartData: ChartData, chartConfig: ChartConfig }) {
    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[400px] w-full"
        >
            <AreaChart data={chartData} margin={{ bottom: 16 }}>
                <defs>
                    <linearGradient id="fillEPA" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-epa)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-epa)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="match"
                    tickLine={true}
                    axisLine={true}
                    tickMargin={4}
                    minTickGap={32}
                    label={{ value: 'Matches Played', position: 'bottom' }}
                />
                <YAxis />
                <ChartTooltip
                    content={({ active, payload, label }) => <EPATooltipContent active={active} payload={payload} label={label} chartData={chartData} />}
                />
                <Area
                    dataKey="epa"
                    type="natural"
                    fill="url(#fillEPA)"
                    stroke="var(--color-epa)"
                    stackId="a"
                />
            </AreaChart>
        </ChartContainer >
    )
}

function ComponentEPAChart({ chartData, chartConfig }: { chartData: ChartData, chartConfig: ChartConfig }) {
    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[400px] w-full relative"
        >
            <AreaChart data={chartData} margin={{ bottom: -12}}>
                <defs>
                    <linearGradient id="fillAutoEPA" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-auto_epa)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-auto_epa)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient id="fillTeleEPA" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-tele_epa)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-tele_epa)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient id="fillEndEPA" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-end_epa)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-end_epa)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="match"
                    tickLine={true}
                    axisLine={true}
                    tickMargin={4}
                    minTickGap={32}
                    label={{ value: 'Matches Played', position: 'bottom' }}
                />
                <YAxis />
                <ChartTooltip
                    content={({ active, payload, label }) => <ComponentEPATooltipContent active={active} payload={payload} label={label} />}
                />
                <ChartLegend
                    content={(props) => <ChartLegendContent payload={props.payload} />}
                    layout="vertical"
                    wrapperStyle={{
                        position: 'absolute',
                        top: -6,
                        left: 72
                    }}
                />
                <Area
                    dataKey="auto_epa"
                    type="natural"
                    fill="url(#fillAutoEPA)"
                    stroke="var(--color-auto_epa)"
                    stackId="a"
                />
                <Area
                    dataKey="end_epa"
                    type="natural"
                    fill="url(#fillEndEPA)"
                    stroke="var(--color-end_epa)"
                    stackId="a"
                />
                <Area
                    dataKey="tele_epa"
                    type="natural"
                    fill="url(#fillTeleEPA)"
                    stroke="var(--color-tele_epa)"
                    stackId="a"
                />
            </AreaChart>
        </ChartContainer >
    )
}

export default EPAAreaChart;