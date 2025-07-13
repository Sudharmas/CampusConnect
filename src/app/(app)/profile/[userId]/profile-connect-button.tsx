
'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ProfileConnectButton() {
    const [isRequestSent, setIsRequestSent] = useState(false);

    return (
        <Button 
            className="w-full button-glow" 
            onClick={() => setIsRequestSent(true)}
            disabled={isRequestSent}
        >
            {isRequestSent ? 'Request Sent' : 'Send Connection Request'}
        </Button>
    )
}
