"use client"

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState
} from "@tanstack/react-table"

import type { Table as TanstackTable } from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"


import type { Team } from "@/types/Team"
import { useNavigate } from "@tanstack/react-router"
import React from "react"
import DatatableFilter from "./data-table-filter"
import { filterByLocation } from "./team-data-columns"
import { Button } from "./ui/button"
import { DataTablePagination } from "./ui/data-table-pagination"
import DataTableSearch from "./ui/data-table-search"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export type GlobalFilter = {
    country: string,
    state_province: string,
    city: string,
    region: string,
    whitelisted_teams: number[]
}

export function DataTable<TData extends Team, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState({
        country: '',
        state_province: '',
        city: '',
        region: '',
        whitelisted_teams: []
    })

    const navigate = useNavigate()

    const table = useReactTable({
        data: data.sort((a, b) => a.team_number - b.team_number),
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),

        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,

        globalFilterFn: filterByLocation,
        onGlobalFilterChange: setGlobalFilter,

        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter
        },
    })

    return (
        <div className="m-4 w-100 sm:w-2xl md:w-3xl lg:w-7xl">
            <DataTableSearch table={table} />
            <DatatableFilter table={table} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
            <Button disabled={Object.keys(rowSelection).length <= 0} onClick={() => {
                navigate({to:'/compare', state: { teams: getTeamsFromSelection(table, rowSelection) }})
            }}>Compare Selected Teams</Button>
        </div>
    )
}

function getTeamsFromSelection<TData>(table: TanstackTable<TData>, rowSelection: object) {
    return Object.keys(rowSelection).reduce((acc: Team[], index) => {
        acc.push(table.getCoreRowModel().flatRows[parseInt(index)].original as Team)
        return acc;
    }, [])
}