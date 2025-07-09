import type { Table } from '@tanstack/react-table';
import { Button } from './button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { Input } from './input';

interface DataTableSearchProps<TData> {
    table: Table<TData>
}

function DataTableSearch<TData>({ table }: DataTableSearchProps<TData>) {
    return (
        <div className="flex items-center py-4">
            <Input
                placeholder="Search by team number..."
                value={(table.getColumn("team_number")?.getFilterValue() as number) ?? null}
                onChange={(event) => {
                    table.getColumn("team_number")?.setFilterValue(event.target.value)

                }
                }
                className="max-w-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        Columns
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                        .getAllColumns()
                        .filter(
                            (column) => column.getCanHide()
                        )
                        .map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            )
                        })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default DataTableSearch;