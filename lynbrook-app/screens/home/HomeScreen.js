import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button, Card, Layout, Text, ListItem } from "@ui-kitten/components";
import moment from "moment-timezone";
import React, { useLayoutEffect, useState, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions,
    Alert,
} from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { useSelector } from "react-redux";
import { isLoaded, useFirestoreConnect, useFirebase, useFirestore } from "react-redux-firebase";
import schedule, { names } from "../../constants/schedule";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";
import { useProfile } from "../../helpers/profile";
import { useTime } from "../../helpers/time";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import TooltipComponent from "../../components/TooltipComponent";
import StepNumberComponent from "../../components/StepNumberComponent";
import { storeData, getData } from "../../helpers/asyncStorage";
import * as ImagePicker from "expo-image-picker";

const WalkthroughableView = walkthroughable(View);

export const RewardsButton = ({ navigation }) => {
    return (
        <View style={{ paddingLeft: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate("Rewards")}>
                <Ionicons name="gift" size={23} color="white"></Ionicons>
            </TouchableOpacity>
        </View>
    );
};

export const QRCodeButton = ({ navigation }) => {
    return (
        <View style={{ paddingRight: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate("QRCode")}>
                <Ionicons name="scan" size={23} color="white"></Ionicons>
            </TouchableOpacity>
        </View>
    );
};

export const UpcomingEvent = ({ item: { title, description, upload }, navigation, getFile }) => {
    return (
        <Card style={{ marginTop: 16 }}>
            <Text category="h6" style={{ marginBottom: 4 }}>
                {title}
            </Text>
            <Text category="p1" style={{ marginBottom: 16 }}>
                {description}
            </Text>
            {upload ? (
                <Button onPress={getFile}>Upload for Points</Button>
            ) : (
                <Button onPress={() => navigation.navigate("QRCode")}>Get Points</Button>
            )}
        </Card>
    );
};

const TextPortion = ({ now }) => {
    if (1 <= now.day() && now.day() <= 5) {
        const today = schedule[now.day() - 1];

        const current = today.find((p) => now.isBetween(p.start, p.end));
        let next = today.find((p) => now.isBefore(p.start));

        if (next != undefined) {
            return (
                <Text category="h6" style={{ marginTop: 4, textAlign: "center" }}>
                    {moment.duration(next.start.diff(now)).humanize()} until {names[next.type]}{" "}
                    starts at {next.start.format("h:mm")}
                </Text>
            );
        }

        if (current != undefined) {
            return (
                <Text category="s1" style={{ marginTop: 4, textAlign: "center" }}>
                    {moment.duration(current.end.diff(now)).humanize()} until {names[current.type]}{" "}
                    ends at {current.end.format("h:mm")}
                </Text>
            );
        }

        if (now.day() + 1 < 6) {
            const tomorrow = schedule[now.day()];
            next = tomorrow[0];
            if (next != undefined) {
                return (
                    <Text category="h6" style={{ marginTop: 4, textAlign: "center" }}>
                        {names[next.type]} starts at {next.start.format("h:mm")}
                    </Text>
                );
            }
        }
    }

    return null;
};

export const ProfileCard = ({ profile: { avatarUrl, displayName, email } }) => (
    <Card style={{ marginBottom: 16, marginTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ marginRight: 16 }}>
                <Avatar source={{ uri: avatarUrl }} size="large"></Avatar>
            </View>
            <View style={{ flex: 1 }}>
                <Text category="h6">{displayName}</Text>
                <Text category="s1">{email}</Text>
            </View>
        </View>
    </Card>
);

export const SpiritPointsCard = ({
    profile: { asbPoints, classPoints },
    checkpoint,
    pointOptions: { pointToggle, toggle },
}) => {
    const points = pointToggle == "ASB" ? asbPoints : classPoints;
    return (
        <Card
            style={{ marginBottom: 16 }}
            header={(props) => (
                <View {...props}>
                    <View style={styles.headerContainer}>
                        <View>
                            <Text category="h6">{pointToggle} Spirit Points</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={toggle}>
                                <Ionicons
                                    color="black"
                                    size={23}
                                    name="toggle"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ marginRight: 16 }}>
                    <ProgressCircle
                        percent={(points / checkpoint) * 100}
                        radius={40}
                        borderWidth={8}
                        color="#3399FF"
                        shadowColor="#DDDDDD"
                        bgColor="#fff"
                    />
                </View>
                <View style={{ flex: 1, marginBottom: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text category="s1" style={{ fontSize: 40 }}>
                            {points}
                        </Text>
                        <Text cateogry="s2" style={{ marginLeft: 5, fontSize: 20 }}>
                            / {checkpoint}
                        </Text>
                    </View>
                    <Text category="p1">
                        {checkpoint - points > 0
                            ? `${checkpoint - points} points to your next reward`
                            : "A reward is ready to be redeemed."}
                    </Text>
                </View>
            </View>
        </Card>
    );
};

export const HomeScreen = ({ navigation, start, copilotEvents }) => {
    useFirestoreConnect([
        "events",
        {
            collection: "prizes",
            orderBy: ["points"],
        },
    ]);

    const events = useSelector((state) => state.firestore.data.events);
    const prizes = useSelector((state) => state.firestore.ordered.prizes);
    const firebase = useFirebase();
    const firestore = useFirestore();

    useFirestoreConnect(["events"]);

    const [profileLoaded, profile] = useProfile();
    const scrollView = useRef(null);
    const [pointToggle, setPointToggle] = useState("ASB");

    const auth = useSelector((state) => state.firebase.auth);

    const authStatus = useAuthStatus();
    const now = useTime();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () =>
                authStatus == AuthStatus.AUTHENTICATED ? (
                    <RewardsButton navigation={navigation} />
                ) : null,
            headerRight: () =>
                authStatus == AuthStatus.AUTHENTICATED ? (
                    <QRCodeButton navigation={navigation} />
                ) : null,
        });
    }, [navigation, authStatus]);

    useEffect(() => {
        let tour = async () => {
            const tours = await getData("tours");
            if (tours == undefined) {
                await storeData("tours", []);
            }
            if (!tours.includes("Home")) {
                start(false, scrollView.current);
                copilotEvents.on("stop", async () => {
                    tours.push("Home");
                    await storeData("tours", tours);
                });
                copilotEvents.on("skip", async () => {
                    tours.push("Home");
                    await storeData("tours", tours);
                });
            }
        };
        tour();
    }, []);

    const toggle = () => {
        if (pointToggle == "ASB") {
            setPointToggle("Class");
        } else {
            setPointToggle("ASB");
        }
    };

    // Display guest screen

    if (authStatus != AuthStatus.AUTHENTICATED) {
        return (
            <Layout
                level="3"
                style={{ ...styles.container, justifyContent: "center", alignItems: "center" }}
            >
                <Text category="h5">Lynbrook High School</Text>
                <Text category="s1" style={{ marginBottom: 32 }}>
                    Welcome, guest user.
                </Text>
                <TextPortion now={now} />
            </Layout>
        );
    }

    // Display loading screen

    if (!profileLoaded || !isLoaded(events) || !isLoaded(prizes)) {
        return (
            <Layout style={(styles.container, { paddingTop: 15 })}>
                <ActivityIndicator accessibilityLabel="Loading" />
            </Layout>
        );
    }

    const getFile = async (id, event) => {
        const request = async (requestType) => {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 0,
                mediaTypes: requestType == 0 ? "Images" : "Videos"
            });
        

            if (result.cancelled) return; // User canceled

            const resp = await fetch(result.uri);
            const blob = await resp.blob();

            const storageRef = firebase.storage().ref();
            // const ref = storageRef.child(
            //     `images/${event.title}/${profile.displayName}-${profile.class}.png`
            // );
            const ref = storageRef.child(
                `${requestType == 0 ? "images" : "videos"}/${event.title}/${profile.displayName}-${profile.class}.${requestType == 0 ? "png" : "mp4"}`
            ); // You should change this to be unique so people don't overwrite each others files
                console.log(blob.type)
            try {
                const snapshot = await ref.put(blob);
                if (!event.users.includes(auth.uid)) {
                    if (event.type == "ASB") {
                        firebase.updateProfile({
                            asbPoints: profile.asbPoints + event.points,
                        });
                    } else {
                        firebase.updateProfile({
                            classPoints: profile.classPoints + event.points,
                        });
                    }
                    Alert.alert(
                        "File Uploaded",
                        `You have successfully uploaded your file and received ${event.points} ASB spirit points and overall class points for the competition. (Check the Viking Games event page for current class standings). Your image will be reviewed by ASB to confirm that it follows submission guidelines. Thank you for participating!`,
                        [{ text: "OK", onPress: () => {} }],
                        { cancelable: false }
                    );
                    let specialEvent = Object.entries(events).find(([, e]) => e.type == "Special");
                    firestore.update(
                        {
                            collection: "events",
                            doc: id,
                        },
                        {
                            users: firestore.FieldValue.arrayUnion(auth.uid),
                        }
                    );
                    firestore.update(
                        {
                            collection: "events",
                            doc: specialEvent[0],
                        },
                        {
                            [`classCount.${profile.class}`] : firestore.FieldValue.increment(event.points),
                        }
                    );
                }
                // Done!
            } catch (error) {
                // Error!
            }
        }
        if (event.fileType == "Image") {
            request(0)
        } else if (event.fileType == "Video") {
            request(1)
        } else {
            await Alert.alert(
                "File Upload Selection",
                `Are you uploading an image or a video?`,
                [{ text: "Image", onPress: () => { request(0) } }, { text: "Video", onPress: () => { request(1) } }],
                { cancelable: false }
            );
        }
    };

    const currentEvents = Object.entries(events)
        .filter(([, item]) => item.type != "Special")
        .filter(([, item]) => item.type == "ASB" || item.type == profile.class)
        .filter(([, item]) => !item.users?.some((user) => user == auth.uid))
        .filter(([, item]) =>
            now.isBetween(moment.unix(item.start.seconds), moment.unix(item.end.seconds))
        );

    const checkEvent = (e, profile) => {
        if (pointToggle == "ASB") {
            return e.type == "ASB" && e.points > profile.asbPoints;
        } else {
            return e.type == profile.class && e.points > profile.classPoints;
        }
    };

    const specialEvent = Object.entries(events).find(([, e]) => e.type == "Special");

    return (
        <Layout style={styles.container} level="3">
            <ScrollView ref={scrollView}>
                {/* <TouchableOpacity onPress={() => start()}>
                    <Text>START THE TUTORIAL!</Text>
                </TouchableOpacity> */}
                <CopilotStep
                    text="Welcome to the Home Page! This page will display your profile and upcoming events!"
                    order={1}
                    name="Home"
                >
                    <WalkthroughableView>
                        <Text category="h5" style={{ textAlign: "center" }}>
                            Lynbrook High School
                        </Text>
                    </WalkthroughableView>
                </CopilotStep>
                <TextPortion now={now} />
                <CopilotStep text="This is your profile." order={2} name="Profile">
                    <WalkthroughableView>
                        <ProfileCard profile={profile} />
                    </WalkthroughableView>
                </CopilotStep>

                <CopilotStep
                    text="View your spirit points here. Toggle the icon to switch between ASB Spirit Points and Class Spirit Points.
                        To obtain spirit points for personal prizes and class competitions, participate in special ASB/Class events below or use the QR Code Scanner in the top right corner."
                    order={3}
                    name="Spirit Points"
                >
                    <WalkthroughableView>
                        <SpiritPointsCard
                            profile={profile}
                            checkpoint={prizes.find((e) => checkEvent(e, profile))?.points ?? 0}
                            pointOptions={{
                                pointToggle: pointToggle,
                                toggle: toggle,
                            }}
                        />
                    </WalkthroughableView>
                </CopilotStep>

                {specialEvent && (
                    <Card style={{ marginBottom: 16 }}>
                        <Text category="h6" style={{ marginBottom: 4 }}>
                            {specialEvent[1].title} is {now.isBefore(moment.unix(specialEvent[1].start.seconds)) ? "Starting Tuesday 10/27" : "Occuring Now"}
                        </Text>
                        <Text category="p1" style={{ marginBottom: 16 }}>
                            Click below for more info on how to participate!
                        </Text>
                        <Button
                            onPress={() => navigation.navigate("Special", { event: specialEvent })}
                        >
                            More Info
                        </Button>
                    </Card>
                )}

                {currentEvents.length > 0 && (
                    <>
                        <Text category="h6" style={{ textAlign: "center" }}>
                            Events
                        </Text>
                        {currentEvents.map(([id, item]) => (
                            <UpcomingEvent
                                item={item}
                                navigation={navigation}
                                key={id}
                                getFile={() => getFile(id, item)}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </Layout>
    );
};

export default copilot({
    stepNumberComponent: StepNumberComponent,
    tooltipComponent: TooltipComponent,
    androidStatusBarVisible: Platform.OS != "ios",
})(HomeScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});
