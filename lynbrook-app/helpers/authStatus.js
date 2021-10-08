import { useSelector } from "react-redux";
import { isEmpty, isLoaded } from "react-redux-firebase";

export const AuthStatus = {
    NONE: 0,
    PENDING: 1,
    GUEST: 2,
    AUTHENTICATED: 3,
    UNVERIFIED: 4,
};

export const useAuthStatus = () => {
    const auth = useSelector((state) => state.firebase.auth);

    if (!isLoaded(auth)) {
        return AuthStatus.PENDING;
    }

    if (isEmpty(auth)) {
        return AuthStatus.NONE;
    }

    if (auth.isAnonymous) {
        return AuthStatus.GUEST;
    }

    if (!auth.emailVerified) {
        return AuthStatus.UNVERIFIED;
    }

    if (auth.providerData[0].providerId == "password") {
        return AuthStatus.GUEST;
    }

    return AuthStatus.AUTHENTICATED;
};
