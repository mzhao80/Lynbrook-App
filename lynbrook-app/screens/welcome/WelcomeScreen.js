import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Google from "expo-google-app-auth";
import React, { useEffect } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";
import { useFirebase } from "react-redux-firebase";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";
import { useProfile } from "../../helpers/profile";

const login = async (firebase) => {
    let user, credential;
    // if (Constants.isDevice) {
    //     try {
    //         await GoogleSignIn.askForPlayServicesAsync();
    //         const ref = await GoogleSignIn.signInAsync();
    //         const data = await GoogleSignIn.GoogleAuthentication.prototype.toJSON();
    //         user = ref.user;
    //         if (ref.type === "success") {
    //             credential = firebase.auth.GoogleAuthProvider.credential(
    //                 data.idToken,
    //                 data.accessToken
    //             );
    //         }
    //     } catch ({ message }) {
    //         alert("login: Error:" + message);
    //     }
    // } else {
    const ref = await Google.logInAsync({
        iosClientId: "591406000207-1hdaq8smlmroulfckiml897i0f5d3gfl.apps.googleusercontent.com",
        androidClientId: "591406000207-63mh061unk5mh5s1von33op52k19as73.apps.googleusercontent.com",
        iosStandaloneAppClientId:
            "591406000207-vpmitfgrh2i4ri0vp2hobcsca6n46unp.apps.googleusercontent.com",
        androidStandaloneAppClientId:
            "591406000207-dnsmlmkte5qv35ehbac69oicfdujh9vg.apps.googleusercontent.com",
    });
    user = ref.user;
    credential = firebase.auth.GoogleAuthProvider.credential(null, ref.accessToken);
    // }

    const domain = user.email.match(/[^@]+$/)[0];

    if (domain != "student.fuhsd.org" && domain != "fuhsd.org") {
        Alert.alert("Error", "Please login with your FUHSD Google account.");
        return;
    }

    await firebase.login({
        credential,
    });
};

const guest = async (firebase) => {
    Alert.alert(
        "Guest Login",
        "Are you sure you wish to login as a guest? Guest users will not be able to use some features of the app.",
        [
            {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
            },
            {
                text: "OK",
                onPress: () => {
                    firebase.auth().signInAnonymously();
                },
            },
        ],
        { cancelable: false }
    );
};
export const WelcomeScreen = () => {
    const authStatus = useAuthStatus();
    const firebase = useFirebase();
    const profile = useProfile();
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            if (authStatus == AuthStatus.AUTHENTICATED) {
                if (profile.setup) {
                    navigation.navigate("Main");
                } else {
                    navigation.navigate("InitializeClass");
                }
            } else if (authStatus == AuthStatus.GUEST) {
                navigation.navigate("Main");
            }
        })();
    });

    if (authStatus == AuthStatus.PENDING) {
        return (
            <View style={styles.container}>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Welcome</Text>
            <View style={styles.step}>
                <View style={styles.iconContainer}>
                    <Ionicons style={styles.icon} name="newspaper" />
                </View>
                <Text style={styles.title}>
                    Stay up-to-date with announcements from LHS, ASB, and your clubs.
                </Text>
            </View>
            <View style={styles.step}>
                <View style={styles.iconContainer}>
                    <Ionicons style={styles.icon} name="calendar-number" />
                </View>
                <Text style={styles.title}>
                    Check out upcoming school events and other important dates.
                </Text>
            </View>
            <View style={styles.step}>
                <View style={styles.iconContainer}>
                    <Ionicons style={styles.icon} name="time" />
                </View>
                <Text style={styles.title}>
                    View daily class and club schedules, including special schedule weeks.
                </Text>
            </View>
            <View style={styles.step}>
                <View style={styles.iconContainer}>
                    <Ionicons style={styles.icon} name="gift" />
                </View>
                <Text style={styles.title}>
                    Earn points for participating in ASB/Class events and use them to redeem rewards
                    and win class competitions!
                </Text>
            </View>

            <View
                style={{
                    ...styles.step,
                    borderBottomWidth: 0,
                    flexDirection: "column",
                }}
            >
                <View>
                    <Button
                        title={"Sign in as Student/Staff \n(Use FUHSD Google Login)"}
                        onPress={login.bind(null, firebase)}
                    />
                </View>
                <Text center subtitle>
                    or
                </Text>
                <Button title="Continue as Guest" onPress={() => navigation.navigate("Login")} />
            </View>
        </ScrollView>
    );
};

/* this should already be fully tested by the library itself */
/* istanbul ignore next */
export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: 30,
    },
    heading: {
        fontWeight: "bold",
        fontSize: 30,
    },
    step: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        borderBottomColor: "#DDDDDD",
        borderBottomWidth: 1,
        paddingBottom: 20,
        paddingTop: 20,
    },
    iconContainer: {
        backgroundColor: "#DDDDDD",
        height: 50,
        width: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        flex: 0,
        marginRight: 20,
    },
    icon: {
        fontSize: 25,
    },
    title: {
        flex: 1,
    },
});
