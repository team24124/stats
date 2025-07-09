import type { Team } from "@/types/Team"
import type { ColumnDef, Row } from "@tanstack/react-table"

import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { Event } from "@/types/Event"
import { useNavigate } from "@tanstack/react-router"
import type { GlobalFilter } from "./data-table"
import { Checkbox } from "./ui/checkbox"
import SortableHeader from "./ui/sortable-table-header"

export const columns: ColumnDef<Team>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "team_number",
        header: "Team Number",
        filterFn: "includesString"
    },
    {
        accessorKey: "epa_total",
        header: ({ column }) => <SortableHeader column={column}> EPA (Total) </SortableHeader>,
        cell: ({ row }) => format(row, "epa_total")
    },
    {
        accessorKey: "auto_epa_total",
        header: ({ column }) => <SortableHeader column={column}> EPA (Auto) </SortableHeader>,
        cell: ({ row }) => format(row, "auto_epa_total")
    },
    {
        accessorKey: "tele_epa_total",
        header: ({ column }) => <SortableHeader column={column}> EPA (TeleOp) </SortableHeader>,
        cell: ({ row }) => format(row, "tele_epa_total")
    },
    {
        accessorKey: "opr",
        header: ({ column }) => <SortableHeader column={column}> OPR (Total) </SortableHeader>,
        cell: ({ row }) => format(row, "opr")
    },
    {
        accessorKey: "opr_auto",
        header: ({ column }) => <SortableHeader column={column}> OPR (Auto) </SortableHeader>,
        cell: ({ row }) => format(row, "opr_auto")
    },
    {
        accessorKey: "opr_tele",
        header: ({ column }) => <SortableHeader column={column}> OPR (TeleOp) </SortableHeader>,
        cell: ({ row }) => format(row, "opr_tele")
    },
    {
        accessorKey: "opr_end",
        header: ({ column }) => <SortableHeader column={column}> OPR (Endgame) </SortableHeader>,
        cell: ({ row }) => format(row, "opr_end")
    },
    {
        id: "actions",
        cell: ({ row }) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const navigate = useNavigate()

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => navigate({ to: `/teams/${row.original.team_number}` })}>View Team Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        enableHiding: false,
    }
]

export const filterByLocation = (row: Row<Team>, _columnId: string, filterValue: GlobalFilter) => {
    const country = filterValue.country
    const state_province = filterValue.state_province
    const city = filterValue.city
    const region = filterValue.region
    const whitelisted_teams = filterValue.whitelisted_teams

    const countryCheck = country != "" ? row.original.country.toLowerCase() === country.toLowerCase() : true;
    const stateProvinceCheck = state_province != "" ? row.original.state_province.toLowerCase() === state_province.toLowerCase() : true;
    const cityCheck = city != "" ? row.original.city.toLowerCase() === city.toLowerCase() : true;
    const regionCheck = region != "" ? row.original.home_region != null && row.original.home_region.toLowerCase() == region.toLowerCase() : true;
    const whitelistCheck = whitelisted_teams != null ? whitelisted_teams.includes(row.original.team_number) : true;

    return countryCheck && stateProvinceCheck && cityCheck && regionCheck && whitelistCheck
};

function filterTeams(TeamData: Team[], filter: GlobalFilter) {
    const country = filter.country
    const state_province = filter.state_province
    const city = filter.city
    const region = filter.region
    const whitelisted_teams = filter.whitelisted_teams

    return TeamData
        .filter((team) => country != "" ? team.country.toLowerCase() === country.toLowerCase() : true)
        .filter((team) => state_province != "" ? team.state_province.toLowerCase() === state_province.toLowerCase() : true)
        .filter((team) => city != "" ? team.city.toLowerCase() === city.toLowerCase() : true)
        .filter((team) => region != "" ? team.home_region != null && team.home_region.toLowerCase() === region.toLowerCase() : true)
        .filter((team) => whitelisted_teams != null ? whitelisted_teams.includes(team.team_number) : true)
        .sort((a, b) => a.team_number - b.team_number)
}

export const getCountryOptions = (TeamData: Team[], filter: GlobalFilter) => {
    const countries: { value: string, label: string }[] = []
    const seen = new Set()

    filterTeams(TeamData, filter).forEach((team) => {
        const value = team.country?.toLowerCase()
        if (!seen.has(value)) {
            countries.push({ value: value, label: team.country })
            seen.add(value)
        }
    })
    return countries;
}

export const getStateProvinceOptions = (TeamData: Team[], filter: GlobalFilter) => {
    const stateProvinces: { value: string, label: string }[] = []
    const seen = new Set()
    filterTeams(TeamData, filter).forEach((team) => {
        const value = team.state_province?.toLowerCase()
        if (!seen.has(value)) {
            stateProvinces.push({ value: value, label: team.state_province })
            seen.add(value)
        }
    })
    return stateProvinces;
}

export const getCityOptions = (TeamData: Team[], filter: GlobalFilter) => {
    const cities: { value: string, label: string }[] = []
    const seen = new Set()
    filterTeams(TeamData, filter).forEach((team) => {
        const value = team.city?.toLowerCase()
        if (!seen.has(value)) {
            cities.push({ value: value, label: team.city })
            seen.add(value)
        }
    })
    return cities;
}

export const getRegionOptions = (TeamData: Team[], filter: GlobalFilter) => {
    const regions: { value: string, label: string }[] = []
    const seen = new Set()
    filterTeams(TeamData, filter).forEach((team) => {
        if (team.home_region != null) {
            const value = team.home_region.toLowerCase()
            if (!seen.has(value)) {
                regions.push({ value: value, label: team.home_region })
                seen.add(value)
            }
        }

    })
    return regions;
}

export const getEventCodes = (EventData: Event[]) => {
    const eventCodes: { value: string, label: string }[] = []
    EventData.forEach((event) => {
        const value = event.event_code.toLowerCase()
        eventCodes.push({ value: value, label: event.event_code })
    })
    return eventCodes
}

function format(row: Row<Team>, metricName: string) {
    const metric = parseFloat(row.getValue(metricName))
    return <div className="ml-4">{metric.toFixed(2)}</div>
}