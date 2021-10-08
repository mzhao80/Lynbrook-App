//
// getTime helper function
// (helpful for testing)
// (and for showing that this hook isn't specific to any datetime library)
//
import moment from "moment-timezone";
import { useEffect, useState } from "react";

export const useTime = (refreshCycle = 1000) => {
    // Returns the current time
    // and queues re-renders every `refreshCycle` milliseconds (default: 1000ms)

    const [now, setNow] = useState(getTime());

    useEffect(() => {
        // Regularly set time in state
        const intervalId = setInterval(() => setNow(getTime()), refreshCycle);

        // Cleanup interval
        return () => clearInterval(intervalId);

        // Specify dependencies for useEffect
    }, [refreshCycle, setInterval, clearInterval, setNow, getTime]);

    return now;
};

export const getTime = () => moment().tz("America/Los_Angeles");
