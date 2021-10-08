import * as eva from "@eva-design/eva";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AppLoading from "expo-app-loading";
import Constants from "expo-constants";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import { Typography } from "react-native-ui-lib";
import { Provider, useSelector } from "react-redux";
import { ReactReduxFirebaseProvider, useFirebase, isLoaded } from "react-redux-firebase";
import typographies from "./constants/typographies";
import { AuthStatus, useAuthStatus } from "./helpers/authStatus";
import mapping from "./mapping.json";
import AppNavigator from "./navigation/AppNavigator";
import store, { rrfProps } from "./store";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

/* istanbul ignore next */
Typography.loadTypographies(typographies);

function AppView({ expoPushToken }) {
    const firebase = useFirebase();
    const authStatus = useAuthStatus();
    const profile = useSelector((state) => state.firebase.profile);
    const loaded = isLoaded(profile);

    useEffect(() => {
        if (
            loaded &&
            (authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST) &&
            expoPushToken &&
            expoPushToken != ""
        ) {
            firebase.updateProfile({
                expoPushToken: expoPushToken,
            });
        }
    }, [expoPushToken, authStatus, loaded]);

    return (
        <View style={styles.container}>
            <AppNavigator screenProps />
        </View>
    );
}

export default function App(props) {
    const [isLoadingComplete, setLoadingComplete] = useState(false);

    const [expoPushToken, setExpoPushToken] = useState("");
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                setNotification(notification);
            }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {}
        );

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    if (!isLoadingComplete && !props.skipLoadingScreen) {
        return (
            <AppLoading
                startAsync={loadResourcesAsync}
                onError={handleLoadingError}
                onFinish={() => handleFinishLoading(setLoadingComplete)}
            />
        );
    } else {
        return (
            <>
                <IconRegistry icons={EvaIconsPack} />
                <ApplicationProvider {...eva} customMapping={mapping} theme={eva.light}>
                    <NavigationContainer>
                        <Provider store={store}>
                            <ReactReduxFirebaseProvider {...rrfProps}>
                                <StatusBar barStyle="light-content" />
                                <AppView expoPushToken={expoPushToken} />
                            </ReactReduxFirebaseProvider>
                        </Provider>
                    </NavigationContainer>
                </ApplicationProvider>
            </>
        );
    }
}

async function sendPushNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "You've got mail! 📬",
            body: "Here is the notification body",
            data: { data: "goes here" },
        },
        trigger: { seconds: 2 },
    });
}

async function loadResourcesAsync() {
    await Promise.all([
        Font.loadAsync({
            ...Ionicons.font,
        }),
        registerForPushNotificationsAsync,
    ]);
}

function handleLoadingError(error) {
    console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
    setLoadingComplete(true);
}

async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
    }

    if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    return token;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});
