import { useSelector } from "react-redux";
import { useAuthStatus, AuthStatus } from "./authStatus";
import { isLoaded, useFirebase } from "react-redux-firebase";
import { useEffect } from "react";

const REQUIRED_FIELDS = {
    periods: {
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        p7: "",
    },
    subscribed: [],
    asbPoints: 0,
    classPoints: 0,
    setup: false,
    class: 0,
};

const GUEST_FIELDS = {
    periods: {
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        p7: "",
    },
    subscribed: [],
};

export const useProfile = () => {
    const authStatus = useAuthStatus();
    const firebase = useFirebase();
    const profile = useSelector((state) => state.firebase.profile);

    // Creating fields if they don't exist yet

    const missing = {};
    let complete = true;

    if (isLoaded(profile) && authStatus == AuthStatus.AUTHENTICATED) {
        for (const field of Object.keys(REQUIRED_FIELDS)) {
            if (!profile.hasOwnProperty(field)) {
                missing[field] = REQUIRED_FIELDS[field];
                complete = false;
            }
        }
    }

    if (isLoaded(profile) && authStatus == AuthStatus.GUEST) {
        for (const field of Object.keys(GUEST_FIELDS)) {
            if (!profile.hasOwnProperty(field)) {
                missing[field] = GUEST_FIELDS[field];
                complete = false;
            }
        }
    }

    useEffect(() => {
        if (!complete) {
            firebase.updateProfile(missing);
        }
    }, [complete]);

    if (authStatus != AuthStatus.AUTHENTICATED && authStatus != AuthStatus.GUEST) {
        return [true, null];
    }

    if (!isLoaded(profile)) {
        return [false, profile];
    }

    return [complete, profile];
};
