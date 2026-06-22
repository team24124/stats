import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, House, ChartLine, ChartColumn, Scale, Medal, Info, CircleQuestionMark, Users, ChartNoAxesCombined } from "lucide-react"

function NavbarDropdown() {
    return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="size-10 my-auto m-4 hover:cursor-pointer transition delay-150 duration-300 ease-in-out hover:scale-120" variant="outline"><Menu /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-30" align="start">
                <DropdownMenuGroup>
              <Link to="/">
                <DropdownMenuItem className="hover:cursor-pointer">
                    <House />
                    Home
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[16px]">Event</DropdownMenuLabel>
              <Link to="/EPA-Compare">
                <DropdownMenuItem className="hover:cursor-pointer">
                    <ChartLine />
                    EPA
                </DropdownMenuItem>
              </Link>
              <Link to="/OPR-Compare">
              <DropdownMenuItem className="hover:cursor-pointer">
                <ChartColumn />
                OPR
              </DropdownMenuItem>
              </Link>
              <Link to="/predict" disabled>
              <DropdownMenuItem disabled>
                <ChartNoAxesCombined />
                Predict
              </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[16px]">Team</DropdownMenuLabel>
              <Link to="/teams">
              <DropdownMenuItem className="hover:cursor-pointer">
                <Scale />
                Evaluate
              </DropdownMenuItem>
              </Link>
              <Link to="/ranking" disabled>
              <DropdownMenuItem disabled>
                <Medal />
                Rankings
              </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[16px]">Info</DropdownMenuLabel>
              <Link to="/explain" disabled>
              <DropdownMenuItem disabled>
                <Info />
                Explainer
              </DropdownMenuItem>
              </Link>
              <Link to="/method" disabled>
              <DropdownMenuItem disabled>
                <CircleQuestionMark />
                Our Method
              </DropdownMenuItem>
              </Link>
              <Link to="/about" disabled>
              <DropdownMenuItem disabled>
                <Users />
                About Us
              </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NavbarDropdown;