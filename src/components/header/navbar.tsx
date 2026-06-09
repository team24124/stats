import {
    NavigationMenu,
    NavigationMenuList
} from "@/components/ui/navigation-menu";
import { NavigationMenuItem } from "@radix-ui/react-navigation-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import NavbarDropdown from "./navbar-dropdown";
import NavSearchbar from "./navbar-searchbar";
import { useSuspenseQuery } from '@tanstack/react-query'
import { getAllTeamData } from '@/queries/getTeamData'

type LinkProp = {
    to: string
    children: React.ReactNode
}

const NavbarLink = ({ to, children }: LinkProp) => {
    return (
        <NavigationMenuItem className="data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-lg transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4">
            <Link to={to} className="active:font-bold" activeProps={{ className: 'font-bold' }}>
                {children}
            </Link>
        </NavigationMenuItem>
    );
};

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