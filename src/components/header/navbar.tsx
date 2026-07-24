import { useNavigate } from "@tanstack/react-router";
import NavbarDropdown from "./navbar-dropdown";
import NavSearchbar from "./navbar-searchbar";
import { useSuspenseQuery } from '@tanstack/react-query'
import { getAllTeamData } from '@/queries/getTeamData'
import type { Team } from "@/types/Team";

function Navbar() {
    const navigate = useNavigate({ from: '/teams' })

    const TeamResponse = useSuspenseQuery(getAllTeamData);

    const TeamData: Team[] = TeamResponse.data

    const handleSearch = (value: string) => {
        navigate({ to: `/teams/${value}` })
    }

    return (
        <div className="flex items-center justify-between p-4 bg-popover text-popover-foreground w-full fixed top-0 left-0 z-50 h-[80px] shadow-sm border-b">
            <div className="flex items-center">
                <NavbarDropdown />
                <a href="https://team24124.github.io" className="size-12 flex items-center justify-center ml-2">
                    <img src="nthsbird.png" alt="logo" className="h-10 w-auto" />
                </a>
            </div>
            <div className="mr-4">
                <NavSearchbar onSelected={handleSearch} items={TeamData} />
            </div>
        </div>
    );
}

export default Navbar;