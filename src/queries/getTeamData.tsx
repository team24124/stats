import type { Team } from "@/types/Team";
import { queryOptions } from "@tanstack/react-query";

export const getAllTeamData = queryOptions({
    queryKey: ['GET_TEAMS'],
    queryFn: async () => {
        const TeamData: Team[] = await (
            await fetch('https://nighthawks-stats.vercel.app/api/teams/')
        ).json();
        return TeamData;
    },
    staleTime: 5 * 60 * 1000 // Keep data fresh for 5 minutes to prevent reretrieving
})

export function getTeamData(teamNumber: string) {
    return queryOptions({
        queryKey: ['GET_TEAM', teamNumber],
        queryFn: async () => {
            const TeamData: Team = await (
                await fetch(`https://nighthawks-stats.vercel.app/api/teams/${teamNumber}`)
            ).json()
            return TeamData
        },
        staleTime: 5 * 60 * 1000 // Keep data fresh for 5 minutes to prevent reretrieving
    });
}