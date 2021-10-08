import { Button, Card, Layout, Text, CheckBox, Input } from "@ui-kitten/components";
import moment from "moment-timezone";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import { ThemeManager } from "react-native-ui-lib";
import { useSelector } from "react-redux";
import { isLoaded, useFirestore, useFirestoreConnect, useFirebase } from "react-redux-firebase";
import { useProfile } from "../../helpers/profile";
import { AuthStatus, useAuthStatus } from "../../helpers/authStatus";
import { Colors } from "react-native-ui-lib";
import { Linking } from "expo";

const ClubTypes = {
    c: "Competition",
    i: "Interest",
    s: "Service",
};

const ClubsDetailScreen = ({ route }) => {
    const id = route.params?.id ?? {};
    const item = route.params?.item ?? {};

    const firebase = useFirebase();
    const firestore = useFirestore();

    const [profileLoaded, profile] = useProfile();
    const authStatus = useAuthStatus();

    const toggleAuthor = (id) => {
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

    const selected = (id) => {
        if (profile.subscribed.some((item) => item.id == id)) {
            return true;
        } else {
            return false;
        }
    };

    if (!profileLoaded) {
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
                    {item.name}
                </Text>
                <Text category="s1">{ClubTypes[item.category] || "N/A"}</Text>
            </View>
            <ScrollView style={styles.content}>
                <Markdown>{item.description || "N/A"}</Markdown>
                <View style={{ marginBottom: 3 }}>
                    <Text>Zoom Information:</Text>
                    <Text
                        style={{ color: Colors.blue20 }}
                        onPress={item.link ? () => Linking.openURL(item.link) : null}
                    >
                        {item.link || "N/A"}
                    </Text>
                </View>
                {item.type == 3 &&
                (authStatus == AuthStatus.AUTHENTICATED || authStatus == AuthStatus.GUEST) ? (
                    <Button style={{ marginTop: 10 }} onPress={() => toggleAuthor(id)}>
                        {selected(id) ? "Remove Club" : "Add Club"}
                    </Button>
                ) : (
                    <></>
                )}
            </ScrollView>
        </Layout>
    );
};

export default ClubsDetailScreen;

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
