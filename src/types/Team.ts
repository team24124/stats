export type Team = {
    team_number: number,
    team_name: string,
    country: string,
    state_province: string,
    city: string,
    home_region: string
    games_played: number,
    matches: string[]

    epa_total: number,
    auto_epa_total: number,
    tele_epa_total: number,
    historical_epa: number[],
    historical_auto_epa: number[],
    historical_tele_epa: number[],

    opr: number,
    opr_auto: number,
    opr_tele: number,
    opr_end: number,
    historical_opr: number[]
    historical_auto_opr: number[]
    historical_tele_opr: number[]
    historical_end_opr: number[]
}