import { createFileRoute } from '@tanstack/react-router'
import Loading from '@/components/loading'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getAllTeamData } from '@/queries/getTeamData'
import type { Team } from '@/types/Team'
import { useState, useMemo } from 'react'
import { X, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TeamSearchbar from '@/components/team-search'

export const Route = createFileRoute('/predict')({
  pendingComponent: () => <Loading />,
  component: Predict,
})

interface TeamSelectorProps {
  label: string;
  selectedTeam: Team | null;
  onSelect: (team: Team | null) => void;
  allTeams: Team[];
  allianceColor: 'red' | 'blue';
}

// Compact Predict Team Selector Component using shared TeamSearchbar
function PredictTeamSelector({
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

function Predict() {
  const teamResponse = useSuspenseQuery(getAllTeamData)
  const teams: Team[] = teamResponse.data

  // State: selected teams for Red and Blue alliances
  const [red1, setRed1] = useState<Team | null>(null)
  const [red2, setRed2] = useState<Team | null>(null)
  const [blue1, setBlue1] = useState<Team | null>(null)
  const [blue2, setBlue2] = useState<Team | null>(null)

  // Prediction model parameters (corresponding to Nest backend)
  const cConstant = 120
  const autoWeight = 1.2
  const teleWeight = 1.0
  const endWeight = 0.8

  // Calculate dynamic average EPA of all active teams as fallback values for empty slots
  const defaultEPA = useMemo(() => {
    const activeTeams = teams.filter((t) => t.games_played > 0)
    const refTeams = activeTeams.length > 0 ? activeTeams : teams
    const avgTotal = refTeams.reduce((sum, t) => sum + (t.epa_total || 0), 0) / (refTeams.length || 1)
    const avgAuto = refTeams.reduce((sum, t) => sum + (t.auto_epa_total || 0), 0) / (refTeams.length || 1)
    const avgTele = refTeams.reduce((sum, t) => sum + (t.tele_epa_total || 0), 0) / (refTeams.length || 1)
    const avgEnd = avgTotal - avgAuto - avgTele

    // Each alliance consists of 2 teams, so baseline for one missing team is half of average
    return {
      total: avgTotal / 2,
      auto: avgAuto / 2,
      tele: avgTele / 2,
      endgame: avgEnd / 2,
    }
  }, [teams])

  // Calculate Red Alliance statistics
  const redStats = useMemo(() => {
    const t1Auto = red1 ? red1.auto_epa_total : defaultEPA.auto
    const t1Tele = red1 ? red1.tele_epa_total : defaultEPA.tele
    const t1Total = red1 ? red1.epa_total : defaultEPA.total
    const t1End = t1Total - t1Auto - t1Tele

    const t2Auto = red2 ? red2.auto_epa_total : defaultEPA.auto
    const t2Tele = red2 ? red2.tele_epa_total : defaultEPA.tele
    const t2Total = red2 ? red2.epa_total : defaultEPA.total
    const t2End = t2Total - t2Auto - t2Tele

    return {
      auto: t1Auto + t2Auto,
      tele: t1Tele + t2Tele,
      endgame: t1End + t2End,
      total: t1Total + t2Total,
    }
  }, [red1, red2, defaultEPA])

  // Calculate Blue Alliance statistics
  const blueStats = useMemo(() => {
    const t1Auto = blue1 ? blue1.auto_epa_total : defaultEPA.auto
    const t1Tele = blue1 ? blue1.tele_epa_total : defaultEPA.tele
    const t1Total = blue1 ? blue1.epa_total : defaultEPA.total
    const t1End = t1Total - t1Auto - t1Tele

    const t2Auto = blue2 ? blue2.auto_epa_total : defaultEPA.auto
    const t2Tele = blue2 ? blue2.tele_epa_total : defaultEPA.tele
    const t2Total = blue2 ? blue2.epa_total : defaultEPA.total
    const t2End = t2Total - t2Auto - t2Tele

    return {
      auto: t1Auto + t2Auto,
      tele: t1Tele + t2Tele,
      endgame: t1End + t2End,
      total: t1Total + t2Total,
    }
  }, [blue1, blue2, defaultEPA])

  // Calculate predicted win rate (based on Nest backend weighted formula and C constant)
  const prediction = useMemo(() => {
    // Efficiency = Auto Weight * Auto + Teleop Weight * Teleop + Endgame Weight * Endgame
    const redEff = autoWeight * redStats.auto + teleWeight * redStats.tele + endWeight * redStats.endgame
    const blueEff = autoWeight * blueStats.auto + teleWeight * blueStats.tele + endWeight * blueStats.endgame

    // Calculate score difference relative to Red Alliance
    const scoreDiff = blueEff - redEff
    // Formula: P(Red Win) = 1 / (1 + 10^(scoreDiff / C))
    const redProb = 1 / (1 + Math.pow(10, scoreDiff / cConstant))
    const blueProb = 1 - redProb

    return {
      redEff,
      blueEff,
      redProb,
      blueProb,
      scoreDiff,
    }
  }, [redStats, blueStats, cConstant, autoWeight, teleWeight, endWeight])

  // Check if all slots are filled
  const allFilled = !!(red1 && red2 && blue1 && blue2)

  return (
    <main className="px-4 py-8 max-w-5xl mx-auto flex flex-col gap-6 w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Predict Matches
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Select teams for Red and Blue alliances to predict the results.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRed1(null)
              setRed2(null)
              setBlue1(null)
              setBlue2(null)
            }}
            className="text-xs hover:cursor-pointer"
          >
            Reset All Teams
          </Button>
        </div>
      </div>

      {!allFilled && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span><b>Notice</b>: Some team slots are empty. The system has automatically used half of the average EPA of all active teams as the default fallback for missing teams.</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Red Alliance */}
        <Card className="border-red-500/20 bg-red-950/5 dark:bg-red-950/10 backdrop-blur-xs">
          <CardHeader className="border-b border-red-500/10 pb-4">
            <CardTitle className="text-red-500 flex items-center gap-2 text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Red Alliance
            </CardTitle>
            <CardDescription className="text-xs text-red-500/70">
              Select 2 teams to form the Red Alliance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-4">
            <PredictTeamSelector
              label="Red Team 1"
              selectedTeam={red1}
              onSelect={setRed1}
              allTeams={teams}
              allianceColor="red"
            />
            <PredictTeamSelector
              label="Red Team 2"
              selectedTeam={red2}
              onSelect={setRed2}
              allTeams={teams}
              allianceColor="red"
            />

            {/* Red Alliance EPA Summary */}
            <div className="mt-4 border-t border-red-500/10 pt-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-red-500/80">Red Alliance Estimated EPA</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between border-b border-red-500/5 pb-1">
                  <span className="text-muted-foreground">Autonomous (Auto):</span>
                  <span className="font-bold text-foreground font-mono">{redStats.auto.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-red-500/5 pb-1">
                  <span className="text-muted-foreground">Teleop:</span>
                  <span className="font-bold text-foreground font-mono">{redStats.tele.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-red-500/5 pb-1">
                  <span className="text-muted-foreground">Endgame:</span>
                  <span className="font-bold text-foreground font-mono">{redStats.endgame.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-red-500/5 pb-1">
                  <span className="text-muted-foreground font-semibold">Total EPA:</span>
                  <span className="font-bold text-red-500 font-mono">{redStats.total.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center Column: Win Rate & Comparison */}
        <div className="flex flex-col gap-6">
          {/* Prediction win rate Card */}
          <Card className="border-border/50 bg-card/65 backdrop-blur-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-base">Prediction results</CardTitle>
              <CardDescription className="text-center text-xs">
                Win rate prediction based on weighted EPA
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Win rate numbers and progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-red-500">Red Win Rate</span>
                    <span className="text-3xl font-extrabold text-red-500 font-mono">
                      {(prediction.redProb * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-blue-500">Blue Win Rate</span>
                    <span className="text-3xl font-extrabold text-blue-500 font-mono">
                      {(prediction.blueProb * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex shadow-inner">
                  <div
                    className="bg-red-500 transition-all duration-500 ease-out"
                    style={{ width: `${prediction.redProb * 100}%` }}
                  />
                  <div
                    className="bg-blue-500 transition-all duration-500 ease-out flex-1"
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold text-muted-foreground border-b pb-1">Detailed breakdown</h3>

                {/* Auto EPA */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-red-500 font-mono font-bold">{redStats.auto.toFixed(1)}</span>
                    <span className="text-muted-foreground">Autonomous</span>
                    <span className="text-blue-500 font-mono font-bold">{blueStats.auto.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-1/2 h-1.5 bg-muted rounded-full overflow-hidden flex justify-end">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (redStats.auto / Math.max(1, redStats.auto + blueStats.auto)) * 100)}%` }}
                      />
                    </div>
                    <div className="w-1/2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (blueStats.auto / Math.max(1, redStats.auto + blueStats.auto)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Teleop EPA */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-red-500 font-mono font-bold">{redStats.tele.toFixed(1)}</span>
                    <span className="text-muted-foreground">Teleop</span>
                    <span className="text-blue-500 font-mono font-bold">{blueStats.tele.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-1/2 h-1.5 bg-muted rounded-full overflow-hidden flex justify-end">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (redStats.tele / Math.max(1, redStats.tele + blueStats.tele)) * 100)}%` }}
                      />
                    </div>
                    <div className="w-1/2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (blueStats.tele / Math.max(1, redStats.tele + blueStats.tele)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Endgame EPA */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-red-500 font-mono font-bold">{redStats.endgame.toFixed(1)}</span>
                    <span className="text-muted-foreground">Endgame</span>
                    <span className="text-blue-500 font-mono font-bold">{blueStats.endgame.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-1/2 h-1.5 bg-muted rounded-full overflow-hidden flex justify-end">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (redStats.endgame / Math.max(1, redStats.endgame + blueStats.endgame)) * 100)}%` }}
                      />
                    </div>
                    <div className="w-1/2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (blueStats.endgame / Math.max(1, redStats.endgame + blueStats.endgame)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Blue Alliance */}
        <Card className="border-blue-500/20 bg-blue-950/5 dark:bg-blue-950/10 backdrop-blur-xs">
          <CardHeader className="border-b border-blue-500/10 pb-4">
            <CardTitle className="text-blue-500 flex items-center gap-2 text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Blue Alliance
            </CardTitle>
            <CardDescription className="text-xs text-blue-500/70">
              Select 2 teams to form the Blue Alliance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-4">
            <PredictTeamSelector
              label="Blue Team 1"
              selectedTeam={blue1}
              onSelect={setBlue1}
              allTeams={teams}
              allianceColor="blue"
            />
            <PredictTeamSelector
              label="Blue Team 2"
              selectedTeam={blue2}
              onSelect={setBlue2}
              allTeams={teams}
              allianceColor="blue"
            />

            {/* Blue Alliance EPA Summary */}
            <div className="mt-4 border-t border-blue-500/10 pt-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-blue-500/80">Blue Alliance Estimated EPA</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between border-b border-blue-500/5 pb-1">
                  <span className="text-muted-foreground">Autonomous (Auto):</span>
                  <span className="font-bold text-foreground font-mono">{blueStats.auto.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-blue-500/5 pb-1">
                  <span className="text-muted-foreground">Teleop:</span>
                  <span className="font-bold text-foreground font-mono">{blueStats.tele.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-blue-500/5 pb-1">
                  <span className="text-muted-foreground">Endgame:</span>
                  <span className="font-bold text-foreground font-mono">{blueStats.endgame.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-blue-500/5 pb-1">
                  <span className="text-muted-foreground font-semibold">Total EPA:</span>
                  <span className="font-bold text-blue-500 font-mono">{blueStats.total.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
