import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { IconArrowNarrowRight } from "@tabler/icons-react";

function LinkSection() {
    return (
        <div className="m-4">
            <Link to='/teams'><Button className="cursor-pointer">View Teams <IconArrowNarrowRight /></Button> </Link>
            <Link to="/compare" className="ml-2"><Button className="cursor-pointer">Compare Teams <IconArrowNarrowRight /> </Button></Link>
        </div>
    );
}

export default LinkSection;