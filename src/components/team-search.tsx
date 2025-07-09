import type { Team } from "@/types/Team";
import { Command as CommandPrimitive } from "cmdk";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";

type Props = {
    onSelected: (inputValue: string) => void;
    items: Team[];
    isLoading?: boolean;
    emptyMessage?: string;
    placeholder?: string;
};

function TeamSearchbar({
    onSelected,
    items,
    isLoading,
    emptyMessage = "No teams found.",
    placeholder = "Search for team by number",
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
        <div className="h-16 mx-4 w-md md:w-2xl lg:w-4xl">
            <Popover open={open} onOpenChange={setOpen}>
                <Command shouldFilter={false}>
                    <PopoverTrigger>
                        <Input value={searchValue} onChange={(e) => onSearchValueChange(e.target.value)} placeholder={placeholder} className="h-16"/>
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
                        className="w-md md:w-2xl lg:min-w-4xl p-0" //w-[--radix-popover-trigger-width]
                    >
                        <CommandList>
                            {isLoading && (
                                <CommandPrimitive.Loading>
                                    <div className="p-1">
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                </CommandPrimitive.Loading>
                            )}
                            {items.length > 0 && !isLoading ? (
                                <CommandGroup>
                                    {items
                                        .filter((team) => team.team_number.toString().includes(searchValue)) // Filter for relevant searches
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

export default TeamSearchbar;