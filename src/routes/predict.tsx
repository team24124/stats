import { createFileRoute, Link } from '@tanstack/react-router'
import Loading from '@/components/loading'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getAllTeamData } from '@/queries/getTeamData'
import { getEventData } from '@/queries/getEventData'
import type { Team } from '@/types/Team'
import type { Event } from '@/types/Event'
import { useState, useMemo, useEffect } from 'react'
import { Search, Info} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PredictTeamSelector } from '@/components/ui/predict-team-selector'
import { EventSearchbar } from '@/components/ui/event-searchbar'

export const Route = createFileRoute('/predict')({
  pendingComponent: () => <Loading />,
  component: Predict,
})

function Predict() {
  const teamResponse = useSuspenseQuery(getAllTeamData)
  const teams: Team[] = teamResponse.data

  const eventResponse = useSuspenseQuery(getEventData)
  const events: Event[] = eventResponse.data

  // State: Match Predictor
  const [red1, setRed1] = useState<Team | null>(null)
  const [red2, setRed2] = useState<Team | null>(null)
  const [blue1, setBlue1] = useState<Team | null>(null)
  const [blue2, setBlue2] = useState<Team | null>(null)

  // State: Event Standings, Matches Schedule (Full), Played Results & Score Details
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [matches, setMatches] = useState<any[]>([]) // Full schedule
  const [results, setResults] = useState<any[]>([]) // Played matches with scores
  const [scores, setScores] = useState<any[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false)

  // Prediction model parameters (corresponding to Nest backend)
  const cConstant = 120
  const autoWeight = 1.2
  const teleWeight = 1.0
  const endWeight = 0.8

  // Fetch complete schedule, played match results, and score details for simulation
  useEffect(() => {
    if (!selectedEvent) {
      setMatches([])
      setResults([])
      setScores([])
      return
    }

    setIsLoadingMatches(true)
    Promise.all([
      fetch(`https://nighthawks-stats.vercel.app/api/events/${selectedEvent.event_code}/schedule/`)
        .then((res) => res.json())
        .catch((err) => {
          console.error("Failed to fetch event schedule:", err)
          return { schedule: [] }
        }),
      fetch(`https://nighthawks-stats.vercel.app/api/events/${selectedEvent.event_code}/matches/`)
        .then((res) => res.json())
        .catch((err) => {
          console.error("Failed to fetch event matches:", err)
          return { matches: [] }
        }),
      fetch(`https://nighthawks-stats.vercel.app/api/events/${selectedEvent.event_code}/scores/`)
        .then((res) => res.json())
        .catch((err) => {
          console.error("Failed to fetch event scores:", err)
          return { matchScores: [] }
        })
    ])
      .then(([scheduleData, matchesData, scoresData]) => {
        setMatches(scheduleData.schedule || [])
        setResults(matchesData.matches || [])
        setScores(scoresData.matchScores || [])
      })
      .finally(() => {
        setIsLoadingMatches(false)
      })
  }, [selectedEvent])

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
    const t1Auto = red1 ? red1.auto_epa_total || 0 : 0
    const t1Tele = red1 ? red1.tele_epa_total || 0 : 0
    const t1Total = red1 ? red1.epa_total || 0 : 0
    const t1End = t1Total - t1Auto - t1Tele

    const t2Auto = red2 ? red2.auto_epa_total || 0 : 0
    const t2Tele = red2 ? red2.tele_epa_total || 0 : 0
    const t2Total = red2 ? red2.epa_total || 0 : 0
    const t2End = t2Total - t2Auto - t2Tele

    return {
      auto: t1Auto + t2Auto,
      tele: t1Tele + t2Tele,
      endgame: t1End + t2End,
      total: t1Total + t2Total,
    }
  }, [red1, red2])

  // Calculate Blue Alliance statistics
  const blueStats = useMemo(() => {
    const t1Auto = blue1 ? blue1.auto_epa_total || 0 : 0
    const t1Tele = blue1 ? blue1.tele_epa_total || 0 : 0
    const t1Total = blue1 ? blue1.epa_total || 0 : 0
    const t1End = t1Total - t1Auto - t1Tele

    const t2Auto = blue2 ? blue2.auto_epa_total || 0 : 0
    const t2Tele = blue2 ? blue2.tele_epa_total || 0 : 0
    const t2Total = blue2 ? blue2.epa_total || 0 : 0
    const t2End = t2Total - t2Auto - t2Tele

    return {
      auto: t1Auto + t2Auto,
      tele: t1Tele + t2Tele,
      endgame: t1End + t2End,
      total: t1Total + t2Total,
    }
  }, [blue1, blue2])

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

  // Check if any slot has a team
  const hasAnyTeam = !!(red1 || red2 || blue1 || blue2)

  // Calculate Predicted Event Standings (Beta) - Simulation based if matches schedule is loaded, otherwise EPA sorted
  const eventTeams = useMemo(() => {
    if (!selectedEvent) return []

    // If matches schedule is available, run simulation matching predict_event_sim.py
    if (matches && matches.length > 0) {
      // Map to accumulate standings stats
      const standingsMap: Record<number, {
        team_number: number;
        team_name: string;
        games_played: number;
        wins: number;
        losses: number;
        ties: number;
        rp: number;
        score: number;
        epa_total: number;
        auto_epa_total: number;
        tele_epa_total: number;
        endgame_epa_total: number;
        opr: number;
        opr_auto: number;
        opr_tele: number;
        opr_end: number;
      }> = {}

      // Get list of teams attending this event
      const attendingTeams = teams.filter((t) => selectedEvent.team_list.includes(t.team_number))

      // Initialize standings for each team
      attendingTeams.forEach((t) => {
        const autoVal = t.auto_epa_total || 0
        const teleVal = t.tele_epa_total || 0
        const totalVal = t.epa_total || 0
        const endVal = totalVal - autoVal - teleVal

        const oprAuto = t.opr_auto || 0
        const oprTele = t.opr_tele || 0
        const oprEnd = t.opr_end || 0
        const oprTotal = t.opr || 0

        standingsMap[t.team_number] = {
          team_number: t.team_number,
          team_name: t.team_name,
          games_played: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          rp: 0,
          score: 0,
          epa_total: totalVal,
          auto_epa_total: autoVal,
          tele_epa_total: teleVal,
          endgame_epa_total: endVal,
          opr: oprTotal,
          opr_auto: oprAuto,
          opr_tele: oprTele,
          opr_end: oprEnd,
        }
      })

      // Helper to fetch stats with fallback for team during simulation
      const getTeamStats = (teamNum: number) => {
        const t = standingsMap[teamNum]
        if (t) {
          return {
            auto: t.auto_epa_total,
            tele: t.tele_epa_total,
            total: t.epa_total,
            endgame: t.endgame_epa_total,
          }
        }
        // Baseline fallback (half of average)
        return {
          auto: defaultEPA.auto,
          tele: defaultEPA.tele,
          total: defaultEPA.total,
          endgame: defaultEPA.endgame,
        }
      }

      // Calculate average bonus RP rates from completed matches to use as expected values for remaining matches
      let totalCompletedWithScores = 0
      let totalRedMovement = 0, totalRedGoal = 0, totalRedPattern = 0
      let totalBlueMovement = 0, totalBlueGoal = 0, totalBluePattern = 0

      scores.forEach((s) => {
        const red = s.alliances?.find((a: any) => a.alliance === 'Red')
        const blue = s.alliances?.find((a: any) => a.alliance === 'Blue')
        if (red && blue) {
          totalCompletedWithScores += 1
          if (red.movementRP) totalRedMovement += 1
          if (red.goalRP) totalRedGoal += 1
          if (red.patternRP) totalRedPattern += 1

          if (blue.movementRP) totalBlueMovement += 1
          if (blue.goalRP) totalBlueGoal += 1
          if (blue.patternRP) totalBluePattern += 1
        }
      })

      const totalBonusRP = totalRedMovement + totalRedGoal + totalRedPattern + totalBlueMovement + totalBlueGoal + totalBluePattern
      const avgBonusRP = totalCompletedWithScores > 0 
        ? totalBonusRP / (2 * totalCompletedWithScores)
        : 0.9 // Default fallback: ~0.9 RP per alliance per match (e.g. 50% movement, 15% goal, 25% pattern)

      // Simulate matches (using actual results if played, otherwise predicting outcomes)
      matches.forEach((m) => {
        const redNums = m.teams?.filter((t: any) => t.station.startsWith('Red')).map((t: any) => t.teamNumber) || []
        const blueNums = m.teams?.filter((t: any) => t.station.startsWith('Blue')).map((t: any) => t.teamNumber) || []

        if (redNums.length === 0 || blueNums.length === 0) return

        // Look for corresponding played match results in results array
        const playedMatch = results.find((r: any) => r.matchNumber === m.matchNumber)
        const isPlayed = playedMatch && playedMatch.postResultTime !== null && playedMatch.postResultTime !== undefined && playedMatch.postResultTime !== '';

        let winner: 'Red' | 'Blue' | 'Tie' = 'Tie'
        let r_rp = 0, b_rp = 0
        let redScoreAdded = 0
        let blueScoreAdded = 0

        if (isPlayed) {
          const redScore = playedMatch.scoreRedFinal ?? 0
          const blueScore = playedMatch.scoreBlueFinal ?? 0
          redScoreAdded = redScore
          blueScoreAdded = blueScore

          // 3-1-0 Win/Loss/Tie RP rules for DECODE season
          if (redScore > blueScore) {
            winner = 'Red'
            r_rp = 3
            b_rp = 0
          } else if (blueScore > redScore) {
            winner = 'Blue'
            r_rp = 0
            b_rp = 3
          } else {
            winner = 'Tie'
            r_rp = 1
            b_rp = 1
          }

          // Add actual bonus RPs if scores detail is available
          const matchScore = scores.find((s: any) => s.matchNumber === m.matchNumber)
          if (matchScore) {
            const redObj = matchScore.alliances?.find((a: any) => a.alliance === 'Red')
            const blueObj = matchScore.alliances?.find((a: any) => a.alliance === 'Blue')
            if (redObj) {
              r_rp += (redObj.movementRP ? 1 : 0) + (redObj.goalRP ? 1 : 0) + (redObj.patternRP ? 1 : 0)
            }
            if (blueObj) {
              b_rp += (blueObj.movementRP ? 1 : 0) + (blueObj.goalRP ? 1 : 0) + (blueObj.patternRP ? 1 : 0)
            }
          } else {
            // Fallback to average bonus RP
            r_rp += avgBonusRP
            b_rp += avgBonusRP
          }
        } else {
          // Calculate Alliance EPAs for unplayed matches
          let redAuto = 0, redTele = 0, redEnd = 0, redTotal = 0
          redNums.forEach((num: number) => {
            const stats = getTeamStats(num)
            redAuto += stats.auto
            redTele += stats.tele
            redEnd += stats.endgame
            redTotal += stats.total
          })

          let blueAuto = 0, blueTele = 0, blueEnd = 0, blueTotal = 0
          blueNums.forEach((num: number) => {
            const stats = getTeamStats(num)
            blueAuto += stats.auto
            blueTele += stats.tele
            blueEnd += stats.endgame
            blueTotal += stats.total
          })

          // Predict outcomes (using auto×1.2, tele×1.0, end×0.8 weights consistent with main calculation)
          const redEff = autoWeight * redAuto + teleWeight * redTele + endWeight * redEnd
          const blueEff = autoWeight * blueAuto + teleWeight * blueTele + endWeight * blueEnd

          const scoreDiff = blueEff - redEff
          const redProb = 1 / (1 + Math.pow(10, scoreDiff / cConstant))

          // Allocate predicted win/loss/tie RP based on 3-1-0 win rate thresholds
          if (redProb > 0.505) {
            winner = 'Red'
            r_rp = 3
            b_rp = 0
          } else if (redProb < 0.495) {
            winner = 'Blue'
            r_rp = 0
            b_rp = 3
          } else {
            winner = 'Tie'
            r_rp = 1
            b_rp = 1
          }

          // Add expected bonus RPs based on averages
          r_rp += avgBonusRP
          b_rp += avgBonusRP

          redScoreAdded = redTotal
          blueScoreAdded = blueTotal
        }

        // Update Red Teams statistics
        redNums.forEach((num: number) => {
          const t = standingsMap[num]
          if (t) {
            t.games_played += 1
            t.rp += r_rp
            t.score += redScoreAdded
            if (winner === 'Red') t.wins += 1
            else if (winner === 'Blue') t.losses += 1
            else t.ties += 1
          }
        })

        // Update Blue Teams statistics
        blueNums.forEach((num: number) => {
          const t = standingsMap[num]
          if (t) {
            t.games_played += 1
            t.rp += b_rp
            t.score += blueScoreAdded
            if (winner === 'Blue') t.wins += 1
            else if (winner === 'Red') t.losses += 1
            else t.ties += 1
          }
        })
      })

      // Sort standings: Sort by RP (descending), then Score (descending)
      return Object.values(standingsMap).sort((a, b) => {
        if (Math.abs(b.rp - a.rp) > 0.01) {
          return b.rp - a.rp
        }
        return b.score - a.score
      })
    }

    // Default Fallback: Sort by EPA Total descending
    return teams
      .filter((t) => selectedEvent.team_list.includes(t.team_number))
      .map((t) => {
        const autoVal = t.auto_epa_total || 0
        const teleVal = t.tele_epa_total || 0
        const totalVal = t.epa_total || 0
        const endVal = totalVal - autoVal - teleVal

        const oprAuto = t.opr_auto || 0
        const oprTele = t.opr_tele || 0
        const oprEnd = t.opr_end || 0
        const oprTotal = t.opr || 0

        return {
          team_number: t.team_number,
          team_name: t.team_name,
          games_played: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          rp: 0,
          score: 0,
          epa_total: totalVal,
          auto_epa_total: autoVal,
          tele_epa_total: teleVal,
          endgame_epa_total: endVal,
          opr: oprTotal,
          opr_auto: oprAuto,
          opr_tele: oprTele,
          opr_end: oprEnd,
        }
      })
      .sort((a, b) => (b.epa_total || 0) - (a.epa_total || 0))
  }, [selectedEvent, teams, matches, results, scores, defaultEPA, autoWeight, teleWeight, endWeight, cConstant])

  return (
    <main className="px-4 py-8 max-w-5xl mx-auto flex flex-col gap-6 w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Predict Matches & Events
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Simulate matches or predict rankings (beta) for events.
          </p>
        </div>
      </div>

      <Tabs defaultValue="match" className="w-full">
        <TabsList className="mb-6 w-full max-w-[400px] grid grid-cols-2">
          <TabsTrigger value="match" className="cursor-pointer">Match Predictor</TabsTrigger>
          <TabsTrigger value="event" className="cursor-pointer">Event Standings (Beta)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Match Predictor */}
        <TabsContent value="match" className="flex flex-col gap-6 outline-none">
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
                      <span className="text-muted-foreground">Autonomous:</span>
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
                          {hasAnyTeam ? `${(prediction.redProb * 100).toFixed(1)}%` : '--.-%'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-blue-500">Blue Win Rate</span>
                        <span className="text-3xl font-extrabold text-blue-500 font-mono">
                          {hasAnyTeam ? `${(prediction.blueProb * 100).toFixed(1)}%` : '--.-%'}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex shadow-inner">
                      {hasAnyTeam && (
                        <>
                          <div
                            className="bg-red-500 transition-all duration-500 ease-out"
                            style={{ width: `${prediction.redProb * 100}%` }}
                          />
                          <div
                            className="bg-blue-500 transition-all duration-500 ease-out flex-1"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Detailed breakdown */}
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
                      <span className="text-muted-foreground">Autonomous:</span>
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
        </TabsContent>

        {/* Tab 2: Event Standings */}
        <TabsContent value="event" className="flex flex-col gap-6 outline-none">
          {/* Event Search Panel */}
          <Card className="border-border/50 bg-card/65 backdrop-blur-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Select Event
              </CardTitle>
              <CardDescription className="text-xs">
                Search events by name, event code, or type a team number to list events they are attending.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventSearchbar
                allEvents={events}
                onSelected={setSelectedEvent}
                className="w-full max-w-xl mx-0 h-12"
                inputClassName="h-12 w-full"
                popoverClassName="w-full max-w-xl p-0"
              />
            </CardContent>
          </Card>

          {/* Event Results Display */}
          {selectedEvent ? (
            <div className="flex flex-col gap-6">
              {/* Event Details Card */}
              <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                        Selected Event
                      </span>
                      <CardTitle className="text-xl font-extrabold mt-0.5">
                        {selectedEvent.event_name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 text-muted-foreground">
                        Code: <span className="font-mono font-bold text-foreground">{selectedEvent.event_code}</span> | Location: {[selectedEvent.city, selectedEvent.state_province, selectedEvent.country].filter(Boolean).join(", ")}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedEvent(null)}
                      className="text-xs cursor-pointer h-8"
                    >
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground flex gap-4 pt-0">
                  <div>Attending Teams: <span className="font-bold text-foreground font-mono">{selectedEvent.team_list?.length || 0}</span></div>
                </CardContent>
              </Card>

              {/* Status Note based on matches schedule loading state */}
              {isLoadingMatches ? (
                <div className="bg-muted/30 border border-border/40 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                  <span>Loading match schedule and running simulation...</span>
                </div>
              ) : matches && matches.length > 0 ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                  <span><b>Simulation Active</b>: Loaded {matches.length} qualification matches. Standings are simulated based on predicted match outcomes.</span>
                </div>
              ) : (
                <div className="bg-muted/40 border border-border/40 text-muted-foreground text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span><b>Default EPA Ranking</b>: No match schedule is available yet. Standings are predicted by sorting teams by EPA Total.</span>
                </div>
              )}

              {/* Standings Table Card */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    Predicted Standings
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {matches && matches.length > 0 
                      ? "Teams ranked by projected final standings (combining actual results of played matches and simulated outcomes of remaining matches)."
                      : "Teams ranked by total Expected Points Added (EPA). Features overall OPR and EPA metrics."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pb-6">
                  {eventTeams.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      No statistics available for teams in this event.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-center font-bold">Rank</TableHead>
                          <TableHead className="w-24 font-bold">Team</TableHead>
                          <TableHead className="min-w-[160px] font-bold">Name</TableHead>
                          {matches && matches.length > 0 && (
                            <>
                              <TableHead className="font-semibold text-purple-500 font-mono">Sim RP</TableHead>
                              <TableHead className="font-semibold text-purple-400 font-mono">Sim W-L-T</TableHead>
                              <TableHead className="font-semibold text-purple-400 font-mono">Sim Avg Score</TableHead>
                            </>
                          )}
                          <TableHead className="font-semibold text-primary">EPA Total</TableHead>
                          <TableHead>EPA Auto</TableHead>
                          <TableHead>EPA Tele</TableHead>
                          <TableHead>EPA End</TableHead>
                          <TableHead className="font-semibold text-secondary">OPR Total</TableHead>
                          <TableHead>OPR Auto</TableHead>
                          <TableHead>OPR Tele</TableHead>
                          <TableHead>OPR End</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventTeams.map((team, index) => (
                          <TableRow key={team.team_number}>
                            <TableCell className="text-center font-bold font-mono">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-bold font-mono">
                              <Link 
                                to="/teams/$teamNumber" 
                                params={{ teamNumber: team.team_number.toString() }}
                                className="text-primary hover:underline hover:cursor-pointer"
                              >
                                #{team.team_number}
                              </Link>
                            </TableCell>
                            <TableCell className="truncate max-w-[200px] text-left font-medium">
                              {team.team_name}
                            </TableCell>
                            {matches && matches.length > 0 && (
                              <>
                                <TableCell className="font-bold font-mono text-purple-500">
                                  {Math.round(team.rp)}
                                </TableCell>
                                <TableCell className="font-mono text-purple-400 text-xs">
                                  {`${team.wins}-${team.losses}-${team.ties}`}
                                </TableCell>
                                <TableCell className="font-mono text-purple-400 font-semibold">
                                  {team.games_played > 0 ? (team.score / team.games_played).toFixed(1) : "0.0"}
                                </TableCell>
                              </>
                            )}
                            <TableCell className="font-bold font-mono text-primary">
                              {team.epa_total?.toFixed(1) || "0.0"}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground/90">
                              {team.auto_epa_total?.toFixed(1) || "0.0"}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground/90">
                              {team.tele_epa_total?.toFixed(1) || "0.0"}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground/90">
                              {team.endgame_epa_total?.toFixed(1) || "0.0"}
                            </TableCell>
                            <TableCell className="font-bold font-mono text-secondary">
                              {team.opr?.toFixed(1) || "0.0"}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground/90">
                              {team.opr_auto?.toFixed(1) || "0.0"}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground/90">
                              {team.opr_tele?.toFixed(1) || "0.0"}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground/90">
                              {team.opr_end?.toFixed(1) || "0.0"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-16 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/5">
              <Info className="w-8 h-8 opacity-45 text-primary" />
              <div className="text-sm font-medium">No event selected</div>
              <div className="text-xs opacity-75">Use the search box above to load an FTC event and view predicted rankings.</div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
