import { Button, Card, Layout, Text, CheckBox, Input } from "@ui-kitten/components";
import moment from "moment-timezone";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import { ThemeManager } from "react-native-ui-lib";
import WebView from "react-native-webview";
import { useSelector } from "react-redux";
import { isLoaded, useFirestore, useFirestoreConnect } from "react-redux-firebase";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";
import { useProfile } from "../../helpers/profile";

const multipleChoice = (poll, vote, firestore, id, uid) => {
    firestore.update(
        {
            collection: "announcements",
            doc: id,
            subcollections: [{ collection: "polls", doc: poll }],
        },
        {
            [`votes.${uid}`]: vote,
        }
    );
};

const shortAnswer = (poll, firestore, id, uid, response) => {
    firestore.update(
        {
            collection: "announcements",
            doc: id,
            subcollections: [{ collection: "polls", doc: poll }],
        },
        {
            [`responses.${uid}`]: response,
        }
    );
};

const check = (poll, firestore, id, uid, checked) => {
    firestore.update(
        {
            collection: "announcements",
            doc: id,
            subcollections: [{ collection: "polls", doc: poll }],
        },
        {
            [`votes.${uid}`]: checked,
        }
    );
};

const Header = (question) => (
    <View style={{ padding: 16 }}>
        <Text category="h6">{question}</Text>
    </View>
);

export const PollCard = ({ polls, poll, firestore, id, uid, value }) => {
    let val;
    switch (polls[poll].type) {
        //MC
        case 1:
            return (
                <Card header={() => Header(polls[poll].name)} style={{ marginTop: 16 }}>
                    {polls[poll].choices.map((choice, cidx) => (
                        <Button
                            key={choice}
                            style={{ marginBottom: 16 }}
                            appearance={polls[poll].votes[uid] === cidx ? "filled" : "outline"}
                            onPress={() => multipleChoice(poll, cidx, firestore, id, uid)}
                        >
                            {choice}
                        </Button>
                    ))}
                </Card>
            );
        //SA
        case 2:
            return (
                <Card header={() => Header(polls[poll].name)} style={{ marginTop: 16 }}>
                    <Input
                        placeholder="Your Answer"
                        value={value}
                        caption="Must contain more than 1 character"
                        onChangeText={(nextValue) => (val = nextValue)}
                    />
                    <Button
                        style={{ marginTop: 16 }}
                        onPress={() => {
                            val.length > 0 && shortAnswer(poll, firestore, id, uid, val);
                        }}
                    >
                        Submit
                    </Button>
                </Card>
            );
        //CB
        case 3:
            let [checked, setChecked] = useState(null);
            checked =
                checked || polls[poll].votes[uid] || Array(polls[poll].choices.length).fill(false);
            return (
                <Card header={() => Header(polls[poll].name)} style={{ marginTop: 16 }}>
                    {polls[poll].choices.map((choice, cidx) => (
                        <CheckBox
                            style={{ marginBottom: 6 }}
                            key={cidx}
                            checked={checked[cidx]}
                            onChange={(nextChecked) => {
                                checked[cidx] = nextChecked;
                                setChecked([...checked]);
                            }}
                        >
                            {choice}
                        </CheckBox>
                    ))}
                    <Button
                        style={{ marginTop: 16 }}
                        onPress={() => check(poll, firestore, id, uid, checked)}
                    >
                        Submit
                    </Button>
                </Card>
            );
    }
};

const AnnouncementDetailScreen = ({ route }) => {
    const id = route.params?.id ?? {};
    const author = route.params?.author ?? {};

    useFirestoreConnect([
        // "authors",
        {
            collection: "announcements",
            doc: id,
            subcollections: [{ collection: "polls" }],
            storeAs: "polls",
        },
    ]);

    const item = useSelector((state) => state.firestore.data.announcements[id]);
    const polls = useSelector((state) => state.firestore.data.polls) || [];
    const auth = useSelector((state) => state.firebase.auth);
    const firestore = useFirestore();

    const [profileLoaded, profile] = useProfile();
    const authStatus = useAuthStatus();

    if (!isLoaded(polls) || !profileLoaded) {
        return (
            <View style={styles.container} paddingT-15>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    return (
        <Layout style={styles.container} level="3">
            <View style={[styles.header, styles.border]}>
                <Text category="h5" style={{ marginBottom: 3 }}>
                    {item.title}
                </Text>
                <Text category="s1">{moment.unix(item.date.seconds).format("MMMM D, YYYY")}</Text>
                <Text category="s1">{author}</Text>
            </View>
            {item.htmlUrl ? (
                <WebView source={{ uri: item.htmlUrl }} />
            ) : (
                <ScrollView style={styles.content}>
                    <Markdown>{item.content}</Markdown>
                    {authStatus == AuthStatus.AUTHENTICATED ? (
                        Object.keys(polls).map((poll) => (
                            <PollCard
                                key={poll}
                                polls={polls}
                                poll={poll}
                                firestore={firestore}
                                id={id}
                                uid={auth.uid}
                                // checked={checked}
                            />
                            // <Card
                            //     header={(props) => (
                            //         <View {...props}>
                            //             <Text category="h6"> {polls[poll].question}</Text>
                            //         </View>
                            //     )}
                            // >
                            //     {polls[poll].choices.map((choice, cidx) => (
                            //         <Button
                            //             style={{ marginTop: cidx == 0 ? 0 : 16 }}
                            //             appearance="outline"
                            //             onPress={() =>
                            //                 select(polls, poll, cidx, firestore, id, profile.providerData[0].uid)
                            //             }
                            //         >
                            //             {choice}
                            //         </Button>
                            //     ))}
                            // </Card>
                        ))
                    ) : (
                        <Text category="s1">Polls only viewable by Lynbrook Students</Text>
                    )}
                </ScrollView>
            )}
        </Layout>
    );
};

export default AnnouncementDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        padding: 15,
    },
    border: {
        borderBottomWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
    },
    content: {
        paddingLeft: 15,
        paddingRight: 15,
    },
});
