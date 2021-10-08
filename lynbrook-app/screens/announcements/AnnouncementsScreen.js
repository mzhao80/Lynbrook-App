import { Divider, Layout, List, ListItem, Text } from "@ui-kitten/components";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { isLoaded, useFirestoreConnect, useFirebase } from "react-redux-firebase";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";
import { useProfile } from "../../helpers/profile";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import TooltipComponent from "../../components/TooltipComponent";
import StepNumberComponent from "../../components/StepNumberComponent";
import { storeData, getData } from "../../helpers/asyncStorage";

const WalkthroughableView = walkthroughable(View);

export const AnnouncementsScreen = ({ navigation, start, copilotEvents }) => {
    // Get firebase data

    useFirestoreConnect([
        "authors",
        {
            collection: "announcements",
            orderBy: [["date", "desc"]],
        },
    ]);

    const authors = useSelector((state) => state.firestore.data.authors);
    const announcements = useSelector((state) => state.firestore.ordered.announcements);

    const [profileLoaded, profile] = useProfile();
    const firebase = useFirebase();

    const authStatus = useAuthStatus();

    useEffect(() => {
        let tour = async () => {
            const tours = await getData("tours")
            if (!tours.includes("Announcements")) {
                start()
                copilotEvents.on("stop", async () => {
                    tours.push("Announcements")
                    await storeData("tours", tours)
                })
                copilotEvents.on("skip", async () => {
                    tours.push("Announcements")
                    await storeData("tours", tours)
                })
            }
        }
        tour()
    }, []);

    // Loading screen

    if (!profileLoaded || !isLoaded(announcements) || !isLoaded(authors)) {
        return (
            <View style={styles.container} paddingT-15>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    // if (authStatus == AuthStatus.AUTHENTICATED && !this.props.profile.hasOwnProperty("subscribed")) {
    //     return (
    //         <View style={styles.container} paddingT-15>
    //             <ActivityIndicator accessibilityLabel="Loading" />
    //         </View>
    //     );
    // }

    // Filter announcements by subscribed array

    let filteredAnnouncements;

    if (authStatus == AuthStatus.AUTHENTICATED) {
        const showAnnouncement = ([id, item]) =>
            authors[item.from.id].type == 1 ||
            item.from.id == `co${profile.class}` ||
            profile.subscribed.some((item2) => item2.id == item.from.id);

        filteredAnnouncements = Object.entries(announcements).filter(showAnnouncement);
    } else {
        const showAnnouncement = ([id, item]) =>
            authors[item.from.id].type == 1;
        filteredAnnouncements = Object.entries(announcements).filter(showAnnouncement);
    }

    // Display announcements

    const renderDate = ({ date }) => (
        <Text category="s1">{moment.unix(date.seconds).format("M/D/YY")}</Text>
    );

    const renderItem = ({ item: [id, item], index }) => {
        if (index == 0) {
            return (
                <CopilotStep text="Click on an announcement/poll for more info." order={2} name="Detail">
                    <WalkthroughableView>
                        <ListItem
                            title={item.title}
                            description={authors[item.from.id].name}
                            accessoryRight={() => renderDate(item)}
                            onPress={() => {
                                navigation.navigate("Detail", { id: item.id, author: authors[item.from.id].name });
                            }}
                        />
                    </WalkthroughableView>
                </CopilotStep>
            )
        } else {
            return (
                <ListItem
                    title={item.title}
                    description={authors[item.from.id].name}
                    accessoryRight={() => renderDate(item)}
                    onPress={() => {
                        navigation.navigate("Detail", { id: item.id, author: authors[item.from.id].name });
                    }}
                />
            )
        }
    };

    return (
        <Layout style={styles.container} level="3">
            <CopilotStep text="Here, you'll find all LHS, ASB, Class, and Club Announcements/Polls." order={1} name="Announcements">
                <WalkthroughableView>
                </WalkthroughableView>
            </CopilotStep>
            <List
                data={filteredAnnouncements}
                renderItem={(index) => renderItem(index)}
                ItemSeparatorComponent={Divider}
            />
        </Layout>
    );
};

export default copilot({
    stepNumberComponent: StepNumberComponent,
    tooltipComponent: TooltipComponent,
    androidStatusBarVisible: Platform.OS != "ios"
})(AnnouncementsScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
