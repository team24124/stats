import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboxboxProps = {
  values: { value: string, label: string }[],
  selected: string,
  setSelected: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
  allowEmpty?: boolean
  showSearchbar?: boolean
}

export function Combobox({ values, selected, setSelected, placeholder = "Select", allowEmpty = true, showSearchbar = true}: ComboxboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selected
            ? values.find((option) => option.value === selected)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {showSearchbar ? <CommandInput placeholder="Search..." className="h-9" /> : <></>}
          <CommandList>
            <CommandEmpty>No result found.</CommandEmpty>
            <CommandGroup>
              {values.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentValue) => {
                    const value = values.find(
                      (option) => option.label.toLowerCase() === currentValue.toLowerCase(),
                    )?.value;
                    setSelected(value == selected && allowEmpty ? "" : value ?? "");
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selected === option.value ? "opacity-100" : "opacity-0" 
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

  )
}
