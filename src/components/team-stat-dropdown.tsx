import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export type Checked = DropdownMenuCheckboxItemProps["checked"]

type Props = {
    statToggles: { epa_total: boolean, epa_auto: boolean, epa_tele: boolean, opr: boolean, opr_tele: boolean, opr_auto: boolean, opr_end: boolean }
    setStatToggles: React.Dispatch<React.SetStateAction<{
         epa_total: boolean, epa_auto: boolean, epa_tele: boolean, opr: boolean, opr_tele: boolean, opr_auto: boolean, opr_end: boolean
    }>>
}

function TeamStatDropdown({ statToggles, setStatToggles }: Props) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Customize Bars</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Toggle to view statistic</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {Object.keys(statToggles).map((value: string) =>
                    <DropdownMenuCheckboxItem
                        key={value}
                        checked={statToggles[value as keyof typeof statToggles]}
                        onCheckedChange={() => {
                            setStatToggles((prev => ({ ...prev, [value]: !prev[value as keyof typeof statToggles] })))
                        }}
                    >
                        {value}
                    </DropdownMenuCheckboxItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default TeamStatDropdown;