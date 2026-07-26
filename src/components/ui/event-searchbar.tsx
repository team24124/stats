import { useState, useMemo } from 'react'
import type { Event } from '@/types/Event'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface EventSearchbarProps {
  onSelected: (event: Event) => void;
  allEvents: Event[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
}

export function EventSearchbar({
  onSelected,
  allEvents,
  placeholder = "Search event by name, code or team number...",
  className,
  inputClassName,
  popoverClassName,
}: EventSearchbarProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredEvents = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()
    if (!cleanSearch) {
      return allEvents.slice(0, 8)
    }

    const isTeamNumber = /^\d+$/.test(cleanSearch)

    return allEvents
      .filter((e) => {
        const matchName = e.event_name.toLowerCase().includes(cleanSearch)
        const matchCode = e.event_code.toLowerCase().includes(cleanSearch)
        const matchTeam = isTeamNumber && e.team_list && e.team_list.some((tNum) => tNum.toString() === cleanSearch)
        return matchName || matchCode || matchTeam
      })
      .sort((a, b) => {
        const startsNameA = a.event_name.toLowerCase().startsWith(cleanSearch)
        const startsNameB = b.event_name.toLowerCase().startsWith(cleanSearch)
        if (startsNameA && !startsNameB) return -1
        if (!startsNameA && startsNameB) return 1

        const startsCodeA = a.event_code.toLowerCase().startsWith(cleanSearch)
        const startsCodeB = b.event_code.toLowerCase().startsWith(cleanSearch)
        if (startsCodeA && !startsCodeB) return -1
        if (!startsCodeA && startsCodeB) return 1

        return a.event_name.localeCompare(b.event_name)
      })
      .slice(0, 8)
  }, [search, allEvents])

  return (
    <div className={className ?? "h-12 w-full max-w-md mx-auto"}>
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <PopoverTrigger>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className={`${inputClassName ?? "h-12"} pl-10`}
              />
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
                e.preventDefault()
              }
            }}
            className={popoverClassName ?? "w-[--radix-popover-trigger-width] max-w-[90vw] p-0"}
          >
            <CommandList>
              {filteredEvents.length === 0 ? (
                <CommandEmpty>No events found</CommandEmpty>
              ) : (
                <CommandGroup heading="Events List">
                  {filteredEvents.map((event) => (
                    <CommandItem
                      key={event.event_code}
                      value={event.event_code}
                      onSelect={() => {
                        onSelected(event)
                        setOpen(false)
                        setSearch("")
                      }}
                      className="flex flex-col items-start gap-0.5 hover:cursor-pointer p-2.5"
                    >
                      <div className="flex items-center gap-2 justify-between w-full">
                        <span className="font-bold text-foreground font-mono text-sm">
                          {event.event_code}
                        </span>
                        <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold font-mono">
                          {event.team_list?.length || 0} Teams
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-1 w-full text-left font-medium">
                        {event.event_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 w-full text-left">
                        {[event.city, event.state_province, event.country].filter(Boolean).join(", ")}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  )
}
