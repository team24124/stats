import { IconCopy } from "@tabler/icons-react";
import { CardAction } from "./ui/card";
import { Badge } from "./ui/badge";
import { useState } from "react";

type Props = {
    text: string
}

function CardCopyAction({
    text
}: Props) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <CardAction className="cursor-pointer" onClick={copyToClipboard}>
            <Badge variant="outline">
                {copied ? "Copied" : "Copy"} <IconCopy />
            </Badge>
        </CardAction>
    );
}

export default CardCopyAction;