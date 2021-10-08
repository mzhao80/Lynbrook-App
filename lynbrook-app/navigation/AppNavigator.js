import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator } from "react-native";
import { AuthStatus, useAuthStatus } from "../helpers/authStatus";
import { useProfile } from "../helpers/profile";
import InitializeClassScreen from "../screens/welcome/InitializeClassScreen";
import InitializeScheduleSreen from "../screens/welcome/InitializeScheduleScreen";
import CompleteSetupScreen from "../screens/welcome/CompleteSetupScreen";
import WelcomeScreen from "../screens/welcome/WelcomeScreen";
import LoginScreen from "../screens/welcome/LoginScreen";
import RegisterScreen from "../screens/welcome/RegisterScreen";
import MainTabNavigator from "./MainTabNavigator";
import React from "react";
import { useSelector } from "react-redux";
import VerifyEmailScreen from "../screens/welcome/VerifyEmailScreen";

const SetupStack = createStackNavigator();

const Setup = () => (
    <SetupStack.Navigator initialRouteName="InitializeClass" headerMode="none">
        <SetupStack.Screen name="InitializeClass" component={InitializeClassScreen} />
        <SetupStack.Screen name="InitializeSchedule" component={InitializeScheduleSreen} />
        <SetupStack.Screen name="CompleteSetup" component={CompleteSetupScreen} />
    </SetupStack.Navigator>
);

const Welcome = () => (
    <SetupStack.Navigator initialRouteName="Welcome" headerMode="none">
        <SetupStack.Screen name="Welcome" component={WelcomeScreen} />
        <SetupStack.Screen name="Login" component={LoginScreen} />
        <SetupStack.Screen name="Register" component={RegisterScreen} />
    </SetupStack.Navigator>
);

const AppNavigator = () => {
    const authStatus = useAuthStatus();
    const [profileLoaded, profile] = useProfile();

    if (authStatus == AuthStatus.PENDING) {
        return <ActivityIndicator accessibilityLabel="Loading" />;
    } else if (authStatus == AuthStatus.NONE) {
        return <Welcome />;
    } else if (authStatus == AuthStatus.AUTHENTICATED && !profileLoaded) {
        return <ActivityIndicator accessibilityLabel="Loading" />;
    } else if (authStatus == AuthStatus.AUTHENTICATED && !profile.setup) {
        return <Setup />;
    } else if (authStatus == AuthStatus.UNVERIFIED) {
        return <VerifyEmailScreen />;
    } else {
        return <MainTabNavigator />;
    }
};

export default AppNavigator;
