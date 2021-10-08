import React from "react";
import { Linking } from "expo";
import { Dimensions, StyleSheet, View, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Text, Card, ListItem as PointsItem } from "@ui-kitten/components";
import { ThemeManager, ListItem, Colors } from "react-native-ui-lib";
import ProgressCircle from "react-native-progress-circle";
import ProgressBar from "react-native-progress/Bar";
import { ProfileCard } from "./HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { useProfile } from "../../helpers/profile";

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

export const SpecialEventScreen = ({ route }) => {
    const [id, event] = route.params?.event ?? {};

    const [profileLoaded, profile] = useProfile();

    const classes = ["2021", "2022", "2023", "2024"];
    const points = event.classCount;
    // const sortedPoints = event.classCount.sort((a, b) => b - a)
    // const checkpoint = 100 + Math.ceil(Math.max(...points) / 100) * 100
    // const placings = ["1st", "2nd", "3rd", "4th"]
    // const displayMessages = classes.forEach((index, c) => sortedPoints.filter((p) => p == event.classCount[index]).length > 1 ? `You're in ${400}` : "Hi")

    const classInstagrams = ["lynbrook2021", "lynbrook2022", "lynbrook2023", "lynbrookclassof2024"];

    const classFacebooks = [
        "lhs2021",
        "395859940822522",
        "lynbrookclassof2023",
        "1603301959845362",
    ];

    if (!profileLoaded) {
        return (
            <View style={styles.container}>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.header, styles.border]}>
                <Text category="h5" style={{ marginBottom: 3 }}>
                    Viking Games
                </Text>
                <Text category="s1">
                    Learn more about how to participate!
                </Text>
            </View>
            <ScrollView>
                <View style={styles.participate}>
                    {/* <Text category="h6">How to Participate:</Text> */}
                    <Markdown>{`Welcome to the Viking Games Class Competition! The school has been mysteriously changed into a virtual reality where Game Shows reign supreme. Will you be able to escape the game masters, or will you be stuck in virtual purgatory with two other unlucky classes?\n\nYou can submit your minigame challenges here to earn points for your class, and make sure to post them on Instagram as well!`}</Markdown>
                </View>
                {classes.map((c) => (
                    <PointsItem
                        key={c}
                        title={c}
                        accessoryRight={() => <Text>{points[c]} Points</Text>}
                    />
                ))}
                <View style={styles.participate}>
                    <Text category="h6">Event Timeline</Text>
                    <Markdown>{`11/23: Family Feud Release\n11/24: Lynbrook's Funniest Home Videos (Minigame)\n11/25: Guess the Giberish Release\n11/26: Master Chef: Thanksgiving Edition (Minigame)\n11/27: End of Week 1 & Points Update\n11/30: The Price is Right Bingo (Minigame)\n12/1: Jeopardy Release\n12/2: Lynbrook's Got Talent (Minigame)\n12/3: Are You Smarter Than a Teacher Release\n12/4: End of Viking Games & Results`}</Markdown>
                </View>
                {/* <LinkListItem
                    title={`Lynbrook Class of ${profile.class} Instagram`}
                    onPress={() =>
                        Linking.openURL(
                            `https://www.instagram.com/${classInstagrams[profile.class - 2021]}`
                        )
                    }
                    iosIcon="logo-instagram"
                    androidIcon="logo-instagram"
                />

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
                /> */}
            </ScrollView>
        </View>
    );
};

SpecialEventScreen.navigationOptions = {
    title: "Special Event",
};

export default SpecialEventScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        padding: 15,
    },
    participate: {
        padding: 15,
    },
    border: {
        borderBottomWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    detailArrow: {
        color: Colors.dark30,
        marginLeft: 15,
    },
});
