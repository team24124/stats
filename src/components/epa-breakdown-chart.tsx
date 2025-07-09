import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import type { Team } from "@/types/Team";

function EPABreakdownChart({ team }: { team: Team }) {
    const chartData = [
        { type: "auto_epa", value: team.auto_epa_total, fill: 'var(--color-auto_epa)' },
        { type: "tele_epa", value: team.tele_epa_total, fill: 'var(--color-tele_epa)' },
        { type: "endgame_epa", value: team.epa_total - team.auto_epa_total - team.tele_epa_total, fill: 'var(--color-endgame_epa)' },
    ]
    const chartConfig = {
        value: {
            label: "Value by type",
        },
        auto_epa: {
            label: "Auto",
            color: "var(--chart-1)",
        },
        tele_epa: {
            label: "TeleOp",
            color: "var(--chart-2)",
        },
        endgame_epa: {
            label: "Endgame",
            color: "var(--chart-3)",
        }
    } satisfies ChartConfig

    return (
        <Card className='lg:col-span-2 row-span-2'>
            <CardHeader>
                <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-3xl">Team EPA breakdown by Scoring Component</CardTitle>
                <CardDescription>Current team EPA broken into individual components</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[400px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={chartData} dataKey="value" nameKey="type" />
                        <ChartLegend
                            content={(props) => <ChartLegendContent payload={props.payload} />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default EPABreakdownChart;