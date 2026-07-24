import type { Team } from '@/types/Team'
import { X } from 'lucide-react'
import TeamSearchbar from '@/components/team-search'

interface TeamSelectorProps {
  label: string;
  selectedTeam: Team | null;
  onSelect: (team: Team | null) => void;
  allTeams: Team[];
  allianceColor: 'red' | 'blue';
}

export function PredictTeamSelector({
  label,
  selectedTeam,
  onSelect,
  allTeams,
  allianceColor,
}: TeamSelectorProps) {
  if (selectedTeam) {
    const isRed = allianceColor === 'red'
    const cardBorderClass = isRed 
      ? 'border-red-500/30 bg-red-950/10 hover:bg-red-950/15' 
      : 'border-blue-500/30 bg-blue-950/10 hover:bg-blue-950/15'

    const autoVal = selectedTeam.auto_epa_total || 0
    const teleVal = selectedTeam.tele_epa_total || 0
    const totalVal = selectedTeam.epa_total || 0
    const endVal = totalVal - autoVal - teleVal

    return (
      <div className={`relative border rounded-lg p-3 transition-all duration-200 flex flex-col gap-2 ${cardBorderClass}`}>
        <button
          onClick={() => onSelect(null)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
          title="Remove Team"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {label}
          </span>
          <span className="text-lg font-bold flex items-baseline gap-2">
            <span className={isRed ? 'text-red-500 font-mono' : 'text-blue-500 font-mono'}>
              #{selectedTeam.team_number}
            </span>
            <span className="text-sm font-medium text-muted-foreground truncate max-w-[150px]">
              {selectedTeam.team_name}
            </span>
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-[10px] text-center border-t border-muted/20 pt-2 mt-1">
          <div>
            <div className="text-muted-foreground">Auto</div>
            <div className="font-bold text-foreground">{autoVal.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Teleop</div>
            <div className="font-bold text-foreground">{teleVal.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Endgame</div>
            <div className="font-bold text-foreground">{endVal.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground font-semibold">Total</div>
            <div className="font-bold text-foreground">{totalVal.toFixed(1)}</div>
          </div>
        </div>
      </div>
    )
  }

  const handleSelect = (teamNumberStr: string) => {
    const selectedTeam = allTeams.find(t => t.team_number.toString() === teamNumberStr)
    if (selectedTeam) {
      onSelect(selectedTeam)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <TeamSearchbar
        onSelected={handleSelect}
        items={allTeams}
        placeholder="Search team..."
        className="h-11 w-full mx-0"
        inputClassName="h-11 w-full"
        popoverClassName="w-80 p-0"
      />
    </div>
  )
}
