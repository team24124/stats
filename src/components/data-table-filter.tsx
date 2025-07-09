import type { Team } from '@/types/Team';
import type { Table } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Combobox } from './combobox';
import { getCityOptions, getCountryOptions, getEventCodes, getRegionOptions, getStateProvinceOptions } from './team-data-columns';
import type { Event } from '@/types/Event';
import { getEventData } from '@/queries/getEventData';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import type { GlobalFilter } from './data-table';

interface DataTableSearchProps<TData> {
    table: Table<TData>
}

function DatatableFilter<TData>({ table }: DataTableSearchProps<TData>) {
    const [selectedCountry, setSelectedCountry] = useState('')
    const [selectedStateProvince, setSelectedStateProvince] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [selectedRegion, setSelectedRegion] = useState('')
    const [selectedEvent, setSelectedEvent] = useState('')

    const teamData: Team[] = []
    const eventResponse = useSuspenseQuery(getEventData);
    const eventData: Event[] = useMemo(() => {
        return eventResponse.isSuccess ? eventResponse.data : []
    }, [eventResponse.data, eventResponse.isSuccess]);

    useEffect(() => {
        table.setGlobalFilter({
            country: selectedCountry,
            state_province: selectedStateProvince,
            city: selectedCity,
            region: selectedRegion,
            whitelisted_teams: eventData.find((event) => event.event_code.toLowerCase() == selectedEvent)?.team_list
        })
    }, [selectedCountry, selectedStateProvince, selectedCity, selectedRegion, selectedEvent, table, eventData])

    table.getCoreRowModel().flatRows.forEach((row) => { teamData.push(row.original as Team) })
    const currentFilters: GlobalFilter = table.getState().globalFilter

    const handleClearFilters = () => {
        setSelectedCountry('')
        setSelectedStateProvince('')
        setSelectedCity('')
        setSelectedRegion('')
        setSelectedEvent('')
    }

    return (
        <div className='grid grid-cols-2 grid-rows-3 gap-x-4 gap-y-4 mb-4 sm:grid-cols-3 sm:grid-rows-2 lg:grid-cols-6 lg:grid-rows-1'>
            <Combobox selected={selectedCountry} setSelected={setSelectedCountry} values={getCountryOptions(teamData, currentFilters)} placeholder='Filter by country...' />
            <Combobox selected={selectedStateProvince} setSelected={setSelectedStateProvince} values={getStateProvinceOptions(teamData, currentFilters)} placeholder='Filter by state/province...' />
            <Combobox selected={selectedCity} setSelected={setSelectedCity} values={getCityOptions(teamData, currentFilters)} placeholder='Filter by city...' />
            <Combobox selected={selectedRegion} setSelected={setSelectedRegion} values={getRegionOptions(teamData, currentFilters)} placeholder='Filter by region...' />
            <Combobox selected={selectedEvent} setSelected={setSelectedEvent} values={getEventCodes(eventData)} placeholder='Teams at event...' />
            <Button onClick={handleClearFilters} className='cursor-pointer'>Clear Filters</Button>
        </div>
    );
}

export default DatatableFilter;