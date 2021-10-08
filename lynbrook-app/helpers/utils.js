import React from "react";
import { ActivityIndicator } from "react-native";
import { isEmpty, isLoaded } from "react-redux-firebase";

export function authStatus({ auth, profile }) {
    if (!isLoaded(auth)) {
        return "loading";
    } else if (isEmpty(auth)) {
        return "none";
    } else if (auth.isAnonymous) {
        return "anonymous";
    } else if (!isLoaded(profile)) {
        return "loading";
    } else {
        return "authenticated";
    }
}

export function withAuthLoading(Component) {
    function AuthLoading(props) {
        const status = authStatus(props);
        if (status == "loading") {
            return <ActivityIndicator accessibilityLabel="Loading" />;
        } else if (status == "none") {
            return <ActivityIndicator accessibilityLabel="Loading" />;
        } else {
            return <Component {...props} authStatus={status} />;
        }
    }
    AuthLoading.navigationOptions = Component.navigationOptions;
    return AuthLoading;
}
