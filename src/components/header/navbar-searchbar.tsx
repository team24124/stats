import type { Team } from "@/types/Team";
import { Command as CommandPrimitive } from "cmdk";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

type Props = {
    onSelected: (inputValue: string) => void;
    items: Team[];
    isLoading?: boolean;
    emptyMessage?: string;
    placeholder?: string;
};

function NavSearchbar({
    onSelected,
    items,
    isLoading,
    emptyMessage = "No teams found.",
    placeholder = "Search for team",
}: Props) {

    const [open, setOpen] = useState(false);
    const [searchValue, onSearchValueChange] = useState('')


    const reset = () => {
        onSearchValueChange("");
    };

    const onSelectItem = (inputValue: string) => {
        onSelected(inputValue)
        setOpen(false);
        reset();
    };

    return (
        <div className="h-12 mx-4 w-[200px] mt-[15px]">
            <Popover open={open} onOpenChange={setOpen}>
                <Command shouldFilter={false}>
                    <PopoverTrigger>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input value={searchValue} onChange={(e) => onSearchValueChange(e.target.value)} placeholder={placeholder} className="h-12 pl-10"/>
                        </div>
                    </PopoverTrigger>
                    {!open && <CommandList aria-hidden="true" className="hidden" />}
                    <PopoverContent
                        asChild
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onInteractOutside={(e) => {
                            if (
                                e.target instanceof Element &&
                                e.target.hasAttribute("cmdk-input")
                            ) {
                                e.preventDefault();
                            }
                        }}
                        className=" p-0" //w-[--radix-popover-trigger-width]
                    >
                        <CommandList>
                            {isLoading && (
                                <CommandPrimitive.Loading>
                                    <div className="p-1">
                                        <Skeleton className="h-12" />
                                    </div>
                                </CommandPrimitive.Loading>
                            )}
                            {items.length > 0 && !isLoading ? (
                                <CommandGroup>
                                    {items
                                        .filter((team) => team.team_number.toString().includes(searchValue) || team.team_name.toLowerCase().includes(searchValue.toLowerCase())) // Filter for relevant searches
                                        .sort((a, b) => {
                                            var numA = a.team_number;
                                            var numB = b.team_number;

                                            var nameA = a.team_name.toLowerCase();
                                            var nameB = b.team_name.toLowerCase();

                                            var nameSearch = false;

                                            // Checks if there are any letters in the search, and sorts based on name instead of number
                                            if(searchValue.toUpperCase() != searchValue.toLowerCase()) nameSearch = true;

                                            // Filters first for teams that start with the number searched, and then numerically
                                            let startsWithA;
                                            let startsWithB;
                                            if(nameSearch) {
                                                startsWithA = nameA.startsWith(searchValue.toLowerCase());
                                                startsWithB = nameB.startsWith(searchValue.toLowerCase());
                                            } else {
                                                startsWithA = numA.toString().startsWith(searchValue);
                                                startsWithB = numB.toString().startsWith(searchValue);
                                            }

                                            if(startsWithA && !startsWithB) return -1;
                                            if(!startsWithA && startsWithB) return 1;

                                            if(nameSearch){
                                                const array = [numA,numB].sort();
                                                if(array[0] == numA) return -1;
                                                return 1;
                                            }
                                            return numA - numB;
                                        })
                                        .slice(0, 8) // Get first 8 elements
                                        .map((option) => ( // Map them onto an element

                                            <CommandItem
                                                key={option.team_number}
                                                value={option.team_number.toString()}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onSelect={onSelectItem}
                                            >
                                                <div className="font-bold text-base">{option.team_number}</div> {option.team_name}
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            ) : null}
                            {!isLoading ? (
                                <CommandEmpty>{emptyMessage ?? "No items."}</CommandEmpty>
                            ) : null}
                        </CommandList>
                    </PopoverContent>
                </Command>
            </Popover>
        </div>
    );
}

export default NavSearchbar;