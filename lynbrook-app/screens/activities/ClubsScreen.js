import { Ionicons } from "@expo/vector-icons";
import React, { useLayoutEffect, useState, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Platform,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    Button,
    Modal,
} from "react-native";
import { Colors, Text, ThemeManager, View } from "react-native-ui-lib";
import { ListItem } from "@ui-kitten/components";
import { useSelector } from "react-redux";
import { isLoaded, useFirebase, useFirestore, useFirestoreConnect } from "react-redux-firebase";
import { useProfile } from "../../helpers/profile";
import { Layout } from "@ui-kitten/components";
// import { Modal } from "react-native-modal";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import TooltipComponent from "../../components/TooltipComponent";
import StepNumberComponent from "../../components/StepNumberComponent";
import { storeData, getData } from "../../helpers/asyncStorage";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";

const WalkthroughableView = walkthroughable(View);

const SortTypes = {
    BY_NAME: 0,
    BY_CATEGORY: 1,
};

const sortAuthorsByCategory = (authors, profile) => {
    const allAuthors = Object.entries(authors);

    const selectedAuthors = allAuthors.filter(([id]) =>
        profile.subscribed.some((item) => item.id == id)
    );
    const requiredAuthors = allAuthors.filter(
        ([id, item]) => item.type == 1 || id == `co${profile.class}`
    );
    const clubAuthors = allAuthors.filter(([, item]) => item.type == 3);

    const filterBy = (x) =>
        clubAuthors.filter(
            ([id, item]) => item.category == x && !selectedAuthors.some(([i]) => i == id)
        );

    return [
        {
            title: "My Clubs",
            data: [...selectedAuthors],
        },
        {
            title: "Competition",
            data: filterBy("c"),
        },
        {
            title: "Interest",
            data: filterBy("i"),
        },
        {
            title: "Service",
            data: filterBy("s"),
        },
    ];
};

const sortAuthorsByName = (authors, profile) => {
    const allAuthors = Object.entries(authors);

    const selectedAuthors = allAuthors.filter(([id]) =>
        profile.subscribed.some((item) => item.id == id)
    );

    const requiredAuthors = allAuthors.filter(
        ([id, item]) => item.type == 1 || id == `co${profile.class}`
    );
    const clubAuthors = allAuthors.filter(([, item]) => item.type == 3);

    return [
        {
            title: "My Clubs",
            data: [...selectedAuthors],
        },
        {
            title: "Other Clubs",
            data: clubAuthors.filter(([id]) => !selectedAuthors.some(([i]) => i == id)),
        },
    ];
};

export const ClubListItem = ({ item, icon, onPress, toggle }) => {
    const ClubIcons = (props) => {
        if (icon != "") {
            return (
                <>
                    <TouchableOpacity onPress={toggle}>
                        <Ionicons
                            color={icon == "add-circle" ? Colors.green40 : Colors.red40}
                            size={23}
                            name="add-circle"
                        />
                    </TouchableOpacity>
                    <View paddingH-8 />
                    <TouchableOpacity onPress={onPress}>
                        <Ionicons size={12} name="chevron-forward" color="#333333" />
                    </TouchableOpacity>
                    <View paddingH-6 />
                </>
            );
        } else {
            return (
                <>
                    <TouchableOpacity onPress={onPress}>
                        <Ionicons size={12} name="chevron-forward" color="#333333" />
                    </TouchableOpacity>
                    <View paddingH-6 />
                </>
            );
        }
    };
    return <ListItem title={item.name} accessoryRight={ClubIcons} onPress={onPress} />;
};

export const ClubsScreen = ({ navigation, start, copilotEvents }) => {
    // Firebase

    const firebase = useFirebase();
    const firestore = useFirestore();

    useFirestoreConnect(["authors"]);

    const [profileLoaded, profile] = useProfile();

    const authors = useSelector((state) => state.firestore.data.authors);

    const [sortType, setSortType] = useState(SortTypes.BY_NAME);
    const sectionList = useRef(null);
    const authStatus = useAuthStatus();

    const changeSort = () => {
        if (sortType == SortTypes.BY_CATEGORY) {
            setSortType(SortTypes.BY_NAME);
        } else if (sortType == SortTypes.BY_NAME) {
            setSortType(SortTypes.BY_CATEGORY);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View paddingR-15>
                    <TouchableOpacity onPress={changeSort}>
                        <Ionicons name="list" size={23} color={Colors.white}></Ionicons>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [changeSort]);

    useEffect(() => {
        let tour = async () => {
            const tours = await getData("tours");
            if (!tours.includes("Clubs")) {
                setTimeout(() => {
                    start();
                }, 500);
                copilotEvents.on("stepChange", (step) => {
                    if (step.order == 3) {
                        sectionList.current.scrollToLocation({
                            sectionIndex: 1,
                            itemIndex: 0,
                        });
                    }
                });
                copilotEvents.on("stop", async () => {
                    tours.push("Clubs");
                    await storeData("tours", tours);
                });
                copilotEvents.on("skip", async () => {
                    tours.push("Clubs");
                    await storeData("tours", tours);
                });
            }
        };
        tour();
    }, []);

    // Loading screen

    if (!profileLoaded || !isLoaded(authors)) {
        return (
            <View style={styles.container}>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    // Utility functions

    const getIcon = (id) => {
        if (
            authors[id].type == 1 ||
            authors[id].type == 2 ||
            (authStatus != AuthStatus.AUTHENTICATED && authStatus != AuthStatus.GUEST)
        ) {
            return "";
        } else if (profile.subscribed.some((item) => item.id == id)) {
            return "remove-circle";
        } else {
            return "add-circle";
        }
    };

    const toggleAuthor = (id) => {
        if (authors[id].type == 1 || authors[id].type == 2) {
            return;
        }

        if (profile.subscribed.some((item) => item.id == id)) {
            firebase.updateProfile({
                subscribed: firestore.FieldValue.arrayRemove(firestore.doc(`/authors/${id}`)),
            });
        } else {
            firebase.updateProfile({
                subscribed: firestore.FieldValue.arrayUnion(firestore.doc(`/authors/${id}`)),
            });
        }
    };

    // Sort types

    let listData = [];

    if (authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST) {
        if (sortType == SortTypes.BY_CATEGORY) {
            listData = sortAuthorsByCategory(authors, profile);
        } else if (sortType == SortTypes.BY_NAME) {
            listData = sortAuthorsByName(authors, profile);
        }
    } else {
        if (sortType == SortTypes.BY_CATEGORY) {
            const allAuthors = Object.entries(authors);
            const clubAuthors = allAuthors.filter(([, item]) => item.type == 3);
            const filterBy = (x) => {
                return clubAuthors.filter(([id, item]) => item.category == x);
            };
            listData = [
                {
                    title: "LHS + Class",
                    data: allAuthors.filter(([, item]) => item.type == 1 || item.type == 2),
                },
                {
                    title: "Competition",
                    data: filterBy("c"),
                },
                {
                    title: "Interest",
                    data: filterBy("i"),
                },
                {
                    title: "Service",
                    data: filterBy("s"),
                },
            ];
        } else if (sortType == SortTypes.BY_NAME) {
            const clubAuthors = Object.entries(authors).filter(([, item]) => item.type == 3);
            listData = [
                {
                    title: "LHS + Class",
                    data: Object.entries(authors).filter(
                        ([, item]) => item.type == 1 || item.type == 2
                    ),
                },
                {
                    title: "Clubs",
                    data: clubAuthors,
                },
            ];
        }
    }

    return (
        <Layout level="3" style={styles.container}>
            <CopilotStep
                text="All Lynbrook clubs are listed here. To view more info about a club, click the info icons to the right."
                order={1}
                name="Clubs"
            >
                {/* <WalkthroughableView style={{ flex: 1, position: "absolute", height: "100%", width: "100%" }} /> */}
                <WalkthroughableView />
            </CopilotStep>
            <SectionList
                ref={sectionList}
                onScrollToIndexFailed={(info) => console.log(info)}
                stickySectionHeadersEnabled={false}
                sections={listData}
                keyExtractor={([id]) => id}
                renderItem={({ item: [id, item] }) => (
                    <ClubListItem
                        item={item}
                        icon={getIcon(id)}
                        onPress={() => navigation.navigate("Detail", { item: item, id: id })}
                        toggle={() => toggleAuthor(id)}
                    />
                )}
                renderSectionHeader={({ section: { title } }) => {
                    if (authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST) {
                        if (title == "My Clubs") {
                            return (
                                <CopilotStep
                                    text="Your clubs are listed on top. To remove a club, click on the minus icon on the right."
                                    order={2}
                                    name="My Clubs"
                                >
                                    <WalkthroughableView>
                                        <View centerV centerH height={30}>
                                            <Text styles={styles.sectionHeader}>{title}</Text>
                                        </View>
                                    </WalkthroughableView>
                                </CopilotStep>
                            );
                        } else {
                            return (
                                <CopilotStep
                                    text="Other clubs are listed at the bottom. To add a club, click on the plus icon to the right. You can sort clubs by type with the button at the top right corner of the screen."
                                    order={3}
                                    name="Other Clubs"
                                >
                                    <WalkthroughableView>
                                        <View centerV centerH height={30}>
                                            <Text styles={styles.sectionHeader}>{title}</Text>
                                        </View>
                                    </WalkthroughableView>
                                </CopilotStep>
                            );
                        }
                    } else {
                        return (
                            <View centerV centerH height={30}>
                                <Text styles={styles.sectionHeader}>{title}</Text>
                            </View>
                        );
                    }
                }}
            />
        </Layout>
    );
};

ClubsScreen.navigationOptions = {
    title: "Clubs",
};

export default copilot({
    stepNumberComponent: StepNumberComponent,
    tooltipComponent: TooltipComponent,
    androidStatusBarVisible: Platform.OS != "ios",
    stepBufferTime: 500,
})(ClubsScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    border: {
        borderBottomWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 3,
    },
    grayed: {
        display: "flex",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        elevation: 5,
    },
    openButton: {
        backgroundColor: "#F194FF",
        padding: 10,
        elevation: 2,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
});
