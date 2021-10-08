import {
    Divider,
    Layout,
    List,
    ListItem as ScheduleListItem,
    Tab,
    TabBar,
    Text,
} from "@ui-kitten/components";
import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    ActivityIndicator,
    SectionList,
    Platform,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import schedule, { names } from "../../constants/schedule";
import { Colors, ListItem, ThemeManager, View } from "react-native-ui-lib";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";
import { useProfile } from "../../helpers/profile";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useFirestoreConnect, isLoaded, useFirebase } from "react-redux-firebase";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import TooltipComponent from "../../components/TooltipComponent";
import StepNumberComponent from "../../components/StepNumberComponent";
import { storeData, getData } from "../../helpers/asyncStorage";
import moment from "moment-timezone";

const WalkthroughableView = walkthroughable(View);

const selectedAuthors = (authors, profile) => {
    const allAuthors = Object.entries(authors);

    const selectedAuthors = allAuthors.filter(([id]) =>
        profile.subscribed.some((item) => item.id == id)
    );

    const authorFormatted = [];

    selectedAuthors.map((item) => {
        if (item[1].day != undefined && item[1].day != "") {
            authorFormatted.push({
                id: item[0],
                item: item[1],
            });
        }
    });

    return [
        authorFormatted.filter((author) => author.item.day == "Monday") || "None",
        authorFormatted.filter((author) => author.item.day == "Tuesday") || "None",
        authorFormatted.filter((author) => author.item.day == "Wednesday") || "None",
        authorFormatted.filter((author) => author.item.day == "Thursday") || "None",
        authorFormatted.filter((author) => author.item.day == "Friday") || "None",
    ];
};

export const LinkListItem = ({ title, iosIcon, androidIcon, onPress }) => (
    <ListItem
        height="auto"
        containerStyle={styles.border}
        activeBackgroundColor={Colors.dark70}
        onPress={onPress}
    >
        <ListItem.Part paddingH-20 paddingV-15 middle>
            <Text text80 style={{ fontWeight: "bold" }}>
                {title}
            </Text>
            <Ionicons
                style={styles.detailArrow}
                name={Platform.OS === "ios" ? iosIcon : androidIcon}
            />
        </ListItem.Part>
    </ListItem>
);

export const ActivitiesScreen = ({ navigation, start, copilotEvents }) => {
    const [profileLoaded, profile] = useProfile();

    var d = new Date();
    var n = d.getDay();

    if (n == 0 || n == 6) {
        n = 1;
    }

    useFirestoreConnect(["authors"]);

    const authors = useSelector((state) => state.firestore.data.authors);

    const [selected, setSelected] = useState(n - 1);
    const authStatus = useAuthStatus();
    const firebase = useFirebase();
    const scrollView = useRef(null);

    let clubs = [];

    let periods = {
        ...names,
    };

    useEffect(() => {
        let tour = async () => {
            const tours = await getData("tours");
            if (!tours.includes("Activities")) {
                start(false, scrollView.current);
                copilotEvents.on("stop", async () => {
                    tours.push("Activities");
                    await storeData("tours", tours);
                });
                copilotEvents.on("skip", async () => {
                    tours.push("Activities");
                    await storeData("tours", tours);
                });
            }
        };
        tour();
    }, []);

    if (
        (authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST) &&
        profileLoaded &&
        isLoaded(authors)
    ) {
        periods = {
            ...periods,
        };
        for (const [k, v] of Object.entries(profile.periods)) {
            if (v != "") {
                periods[k] = v;
            }
            // } else {
            //     periods[k] = ""
            // }
        }
        clubs = selectedAuthors(authors, profile);
    }

    const renderTime = (item) => (
        <Text category="s1">
            {item.start.format("h:mm")} – {item.end.format("h:mm")}
        </Text>
    );

    const renderItem = ({ item }) => {
        if (item.start == undefined) {
            return (
                <ScheduleListItem
                    appearance="big"
                    title={`${item.item.name}`}
                    accessoryRight={() => {
                        return (
                            <>
                                <Text category="s1">{item.item.time}</Text>
                                <View paddingH-8></View>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("Detail", {
                                            item: item.item,
                                            id: item.id,
                                        })
                                    }
                                >
                                    <Ionicons
                                        size={23}
                                        name="information-circle"
                                    />
                                </TouchableOpacity>
                            </>
                        );
                    }}
                />
            );
        }
        return (
            <ScheduleListItem
                appearance="big"
                title={`${periods[item.type]}`}
                accessoryRight={() => renderTime(item)}
            />
        );
    };

    if (!profileLoaded || !isLoaded(authors)) {
        return (
            <View style={styles.container}>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    let data = [];

    if (authStatus != AuthStatus.AUTHENTICATED && authStatus != AuthStatus.GUEST) {
        data = [
            {
                title: "Schedule",
                data: schedule[selected],
            },
        ];
    } else {
        data = [
            {
                title: "Schedule",
                data: schedule[selected].filter((period) => periods[period.type] != ""),
            },
            {
                title: `${days[selected]} Clubs`,
                data: clubs[selected],
            },
        ];
    }

    const status = authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST;

    return (
        <Layout level="3" style={styles.container}>
            <CopilotStep
                text={
                    status
                        ? "Here you can find information on your schedule and clubs."
                        : "Here you can find the school schedule and view club information."
                }
                order={1}
                name="Activities"
            >
                <WalkthroughableView></WalkthroughableView>
            </CopilotStep>
            <CopilotStep text="Select the day you would like to view here." order={2} name="Day">
                <WalkthroughableView>
                    <TabBar
                        style={{ paddingTop: 12, paddingBottom: 8 }}
                        selectedIndex={selected}
                        onSelect={(index) => setSelected(index)}
                    >
                        <Tab title="MON" />
                        <Tab title="TUES" />
                        <Tab title="WED" />
                        <Tab title="THURS" />
                        <Tab title="FRI" />
                    </TabBar>
                </WalkthroughableView>
            </CopilotStep>
            {/* <List
                data={ ["Schedule", ...schedule[selected].filter((period) => periods[period.type] != ""), "Clubs", ...clubs[selected]]}
                renderItem={renderItem}
                ItemSeparatorComponent={Divider}
            /> */}
            {schedule[selected].length > 0 ? <SectionList
                stickySectionHeadersEnabled={false}
                sections={data}
                keyExtractor={(item, index) => index}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => {
                    const needSchedule =
                        status &&
                        profileLoaded &&
                        profile.periods.p1 == "" &&
                        profile.periods.p2 == "" &&
                        profile.periods.p3 == "" &&
                        profile.periods.p4 == "" &&
                        profile.periods.p5 == "" &&
                        profile.periods.p6 == "" &&
                        profile.periods.p7 == "" &&
                        title == "Schedule";
                    const needClubs = status && data[1].data.length == 0 && title != "Schedule";
                    return (
                        <CopilotStep
                            text={
                                title == "Schedule"
                                    ? "Your class schedule for each day is shown here. You can customize your class names in settings."
                                    : "Your clubs for each day are shown below your schedule. If this is empty, either you don't have a club today or you haven't added your clubs yet (in Club Settings.)"
                            }
                            order={title == "Schedule" ? 3 : 4}
                            name={title}
                        >
                            <WalkthroughableView>
                                <View
                                    centerV
                                    centerH
                                    height={needSchedule || needClubs ? "auto" : 30}
                                    style={{ padding: needSchedule || needClubs ? 8 : 0 }}
                                >
                                    <Text styles={styles.sectionHeader}>{title}</Text>
                                    {needClubs && (
                                        <Text
                                            category="s2"
                                            style={{ textAlign: "center", padding: 6 }}
                                        >
                                            Add clubs in Clubs Settings below.
                                        </Text>
                                    )}
                                    {needSchedule && (
                                        <Text
                                            category="s2"
                                            style={{ textAlign: "center", padding: 6 }}
                                        >
                                            Add custom names for your classes in settings.
                                        </Text>
                                    )}
                                </View>
                            </WalkthroughableView>
                        </CopilotStep>
                    );
                }}
                ItemSeparatorComponent={Divider}
            /> 
            : 
            <CopilotStep
                text="Activities including your schedule and clubs will be listed here."
                order={3}
                name="No School"
            >
                <WalkthroughableView>
                    <Text
                        category="s2"
                        style={{ textAlign: "center", padding: 10 }}
                    >
                        No School
                    </Text>
                </WalkthroughableView>
            </CopilotStep>}
            <CopilotStep
                text={
                    status
                        ? "You can add, remove, or view club descriptions/Zoom links in Club Settings."
                        : "View clubs here."
                }
                order={status && schedule[selected].length > 0 ? 5 : 4}
                name="Settings"
            >
                <WalkthroughableView>
                    <LinkListItem
                        title={status ? "Clubs Settings" : "Clubs Info"}
                        onPress={() => navigation.navigate("Clubs")}
                        iosIcon="chevron-forward"
                        androidIcon="chevron-forward"
                    />
                </WalkthroughableView>
            </CopilotStep>
        </Layout>
    );
};

export default copilot({
    stepNumberComponent: StepNumberComponent,
    tooltipComponent: TooltipComponent,
    androidStatusBarVisible: Platform.OS != "ios",
})(ActivitiesScreen);
/* this should already be fully tested by the library itself */
/* istanbul ignore next */

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    border: {
        borderBottomWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
    },
});
