import { Ionicons } from "@expo/vector-icons";
import { Linking } from "expo";
import React, { useState, useEffect, useRef } from "react";
import { ActivityIndicator, Button, Platform, ScrollView, StyleSheet } from "react-native";
import { Avatar, Colors, ListItem, Text, ThemeManager, View } from "react-native-ui-lib";
import { useFirebase } from "react-redux-firebase";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";
import { useProfile } from "../../helpers/profile";
import { Layout } from "@ui-kitten/components";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import TooltipComponent from "../../components/TooltipComponent";
import StepNumberComponent from "../../components/StepNumberComponent";
import { storeData, getData } from "../../helpers/asyncStorage";

const WalkthroughableView = walkthroughable(View);

export const ProfileStrip = ({ profile: { avatarUrl, displayName, email } }) => (
    <ListItem height="auto" containerStyle={styles.border} paddingH-20 paddingV-15>
        {avatarUrl && (
            <ListItem.Part left>
                <Avatar source={{ uri: avatarUrl }}></Avatar>
            </ListItem.Part>
        )}
        <ListItem.Part column middle marginL-20>
            <Text h1 marginB-3>
                {displayName || "Guest User"}
            </Text>
            <Text subtitle>{email}</Text>
        </ListItem.Part>
    </ListItem>
);

export const LinkListItem = ({ title, iosIcon, androidIcon, onPress }) => (
    <ListItem
        height="auto"
        containerStyle={styles.border}
        activeBackgroundColor={Colors.dark70}
        onPress={onPress}
    >
        <ListItem.Part paddingH-20 paddingV-15 middle>
            <Text text80>{title}</Text>
            <Ionicons
                style={styles.detailArrow}
                name={Platform.OS === "ios" ? iosIcon : androidIcon}
            />
        </ListItem.Part>
    </ListItem>
);

export const AuthenticatedLinks = ({ profile, navigation }) => (
    <>
        <CopilotStep text="Below are your profile settings." order={1} name="Settings">
            <WalkthroughableView>
                <ProfileStrip profile={profile}></ProfileStrip>
            </WalkthroughableView>
        </CopilotStep>

        <View paddingT-30 style={styles.border}></View>

        <CopilotStep text="Click here to customize your class schedule." order={2} name="Schedule">
            <WalkthroughableView>
                <LinkListItem
                    title="Schedule"
                    onPress={() => navigation.navigate("Schedule")}
                    iosIcon="chevron-forward"
                    androidIcon="chevron-forward"
                />
            </WalkthroughableView>
        </CopilotStep>

        <View paddingT-30 style={styles.border}></View>
    </>
);

export const SettingsScreen = ({ navigation, start, copilotEvents }) => {
    const firebase = useFirebase();

    const [profileLoaded, profile] = useProfile();

    const scrollView = useRef(null);

    const authStatus = useAuthStatus();

    const classInstagrams = ["lynbrook2021", "lynbrook2022", "lynbrook2023", "lynbrookclassof2024"];

    const classFacebooks = [
        "lhs2021",
        "395859940822522",
        "lynbrookclassof2023",
        "1603301959845362",
    ];

    useEffect(() => {
        let tour = async () => {
            const tours = await getData("tours");
            if (!tours.includes("Settings")) {
                start(false, scrollView.current);
                copilotEvents.on("stop", async () => {
                    // firebase.updateProfile({
                    //     tours: tours.push("Home")
                    // })
                    tours.push("Settings");
                    await storeData("tours", tours);
                });
                copilotEvents.on("skip", async () => {
                    // firebase.updateProfile({
                    //     tours: tours.push("Home")
                    // })
                    tours.push("Settings");
                    await storeData("tours", tours);
                });
            }
        };
        tour();
    }, []);

    if (authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST) {
        if (!profileLoaded) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator accessibilityLabel="Loading" />
                </View>
            );
        }
    }

    return (
        <Layout level="3" style={styles.container}>
            <ScrollView ref={scrollView}>
                <View paddingT-30 style={styles.border}></View>

                {(authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST) && (
                    <AuthenticatedLinks profile={profile} navigation={navigation} />
                )}

                <CopilotStep
                    text="Here are some important quick links."
                    order={authStatus == AuthStatus.AUTHENTICATED ? 3 : 1}
                    name="Links"
                >
                    <WalkthroughableView>
                        <LinkListItem
                            title="Lynbrook High School Website"
                            onPress={() => Linking.openURL("https://lhs.fuhsd.org")}
                            iosIcon="link"
                            androidIcon="link"
                        />

                        <LinkListItem
                            title="Schoology"
                            onPress={() => Linking.openURL("https://fuhsd.schoology.com")}
                            iosIcon="link"
                            androidIcon="link"
                        />

                        <LinkListItem
                            title="Infinite Campus"
                            onPress={() =>
                                Linking.openURL(
                                    "https://campus.fuhsd.org/campus/portal/fremont.jsp"
                                )
                            }
                            iosIcon="link"
                            androidIcon="link"
                        />

                        <LinkListItem
                            title="Naviance"
                            onPress={() =>
                                Linking.openURL("https://student.naviance.com/lynbrookhs")
                            }
                            iosIcon="link"
                            androidIcon="link"
                        />

                        <View paddingT-30 style={styles.border}></View>

                        <LinkListItem
                            title="Guidance & Student Support Resources"
                            onPress={() =>
                                Linking.openURL(
                                    "https://lhs.fuhsd.org/guidance-student-support/high-school-planning/forms-and-quicklinks"
                                )
                            }
                            iosIcon="link"
                            androidIcon="link"
                        />

                        <View paddingT-30 style={styles.border}></View>

                        <LinkListItem
                            title="Lynbrook ASB Website"
                            onPress={() => Linking.openURL("https://www.lynbrookasb.com")}
                            iosIcon="link"
                            androidIcon="link"
                        />

                        <LinkListItem
                            title="The Epic"
                            onPress={() => Linking.openURL("https://lhsepic.com")}
                            iosIcon="link"
                            androidIcon="link"
                        />

                        <LinkListItem
                            title="Lynbrook Facebook Group"
                            onPress={() =>
                                Linking.openURL(
                                    "https://www.facebook.com/groups/lynbrookhighschool/"
                                )
                            }
                            iosIcon="logo-facebook"
                            androidIcon="logo-facebook"
                        />

                        <LinkListItem
                            title="Lynbrook ASB Instagram"
                            onPress={() =>
                                Linking.openURL("https://www.instagram.com/lynbrookasb/")
                            }
                            iosIcon="logo-instagram"
                            androidIcon="logo-instagram"
                        />

                        {authStatus == AuthStatus.AUTHENTICATED && (
                            <>
                                <LinkListItem
                                    title={`Lynbrook Class of ${profile.class} Facebook`}
                                    onPress={() =>
                                        Linking.openURL(
                                            `https://www.facebook.com/groups/${
                                                classFacebooks[profile.class - 2021]
                                            }`
                                        )
                                    }
                                    iosIcon="logo-facebook"
                                    androidIcon="logo-facebook"
                                />

                                <LinkListItem
                                    title={`Lynbrook Class of ${profile.class} Instagram`}
                                    onPress={() =>
                                        Linking.openURL(
                                            `https://www.instagram.com/${
                                                classInstagrams[profile.class - 2021]
                                            }`
                                        )
                                    }
                                    iosIcon="logo-instagram"
                                    androidIcon="logo-instagram"
                                />
                            </>
                        )}

                        <LinkListItem
                            title="Lynbrook Principal Twitter"
                            onPress={() => Linking.openURL("https://twitter.com/lhsvikingprin/")}
                            iosIcon="logo-twitter"
                            androidIcon="logo-twitter"
                        />
                    </WalkthroughableView>
                </CopilotStep>

                <View paddingT-30 style={styles.border}></View>

                <CopilotStep
                    text="Click here to sign out."
                    order={authStatus == AuthStatus.AUTHENTICATED ? 4 : 2}
                    name="Sign out"
                >
                    <WalkthroughableView>
                        <ListItem height="auto" containerStyle={styles.border}>
                            <ListItem.Part paddingH-20 paddingV-15 middle>
                                <Button title="Sign out" onPress={() => firebase.logout()} />
                            </ListItem.Part>
                        </ListItem>
                    </WalkthroughableView>
                </CopilotStep>
            </ScrollView>
        </Layout>
    );
};

export class SettingsScreenold extends React.Component {
    static navigationOptions = {
        title: "Settings",
        headerStyle: {
            backgroundColor: "#043265",
        },
        headerTintColor: "#fff",
    };

    constructor(props) {
        super(props);
    }

    async logout() {
        await this.props.firebase.logout();
    }

    updateProfile = () => {
        if (this.props.authStatus == "authenticated") {
            if (!this.props.profile.hasOwnProperty("subscribed")) {
                this.props.firebase.updateProfile({
                    subscribed: [],
                });
            }
            if (!this.props.profile.hasOwnProperty("periods")) {
                this.props.firebase.updateProfile({
                    periods: {
                        p1: "",
                        p2: "",
                        p3: "",
                        p4: "",
                        p5: "",
                        p6: "",
                        p7: "",
                    },
                });
            }
        }
    };

    componentDidMount = this.updateProfile;
    componentDidUpdate = this.updateProfile;
}

SettingsScreen.navigationOptions = {
    title: "Settings",
};

export default copilot({
    stepNumberComponent: StepNumberComponent,
    tooltipComponent: TooltipComponent,
    androidStatusBarVisible: Platform.OS != "ios",
    stepBufferTime: 500,
})(SettingsScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    border: {
        borderBottomWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
    },
    listitemwrapper: {
        borderBottomWidth: 1,
        borderBottomColor: "#DDDDDD",
        backgroundColor: "#FFFFFF",
    },
    listspace: {
        borderBottomWidth: 1,
        borderBottomColor: "#DDDDDD",
        paddingTop: 30,
    },
    listitem: {
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detailArrow: {
        color: Colors.dark30,
        marginLeft: 15,
    },
    profile: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 20,
    },
    profileInfo: {
        marginTop: -3,
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 3,
    },
    description: {
        fontSize: 16,
        color: "#7F7F7F",
    },
    heading: {
        fontSize: 16,
    },
});
