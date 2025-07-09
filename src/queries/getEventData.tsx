import { queryOptions } from "@tanstack/react-query";

export const getEventData = queryOptions({
    queryKey: ['GET_EVENTS'],
    queryFn: async () => {
        const TeamData = await (
            await fetch('https://nighthawks-stats.vercel.app/api/events/')
        ).json();
        return TeamData;
    },
    staleTime: 5 * 60 * 1000
})