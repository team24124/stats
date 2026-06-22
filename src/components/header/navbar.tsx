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
        <div className="grid grid-cols-12 p-4 bg-popover text-popover-foreground min-w-md fixed">
            <NavbarDropdown />
            <a href="https://team24124.github.io" className="size-12 my-auto m-4"><img src="nthsbird.png" /></a>
            <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
            <NavSearchbar onSelected={handleSearch} items={TeamData} />
        </div>
    );
}

export default Navbar;