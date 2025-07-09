import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "./button";
import type { Team } from "@/types/Team";

function SortableHeader({ column, children }: { column: Column<Team, unknown>, children: React.ReactNode }) {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {children}
            <div className="h-4 w-2">
                {column.getIsSorted() == "asc" ? <ArrowDown /> : <ArrowUp />}
            </div>
        </Button>
    );
}

export default SortableHeader;