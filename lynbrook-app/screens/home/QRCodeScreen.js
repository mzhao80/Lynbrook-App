import { Linking } from "expo";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Permissions from "expo-permissions";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import Dialog from "react-native-dialog";
import { useSelector } from "react-redux";
import { useFirebase, useFirestore, useFirestoreConnect } from "react-redux-firebase";
import { useProfile } from "../../helpers/profile";

export const EnterManuallyButton = ({ onSubmit }) => {
    const [visible, setVisible] = useState(false);
    const [code, setCode] = useState("");

    const showDialog = () => {
        setCode("");
        setVisible(true);
    };

    const handleSubmit = () => {
        setVisible(false);
        setTimeout(() => onSubmit(code), 500);
    };

    return (
        <View>
            <Button title={"Enter Manually"} onPress={showDialog} />

            <Dialog.Container visible={visible}>
                <Dialog.Title>Enter Code</Dialog.Title>
                <Dialog.Description>Please enter the 6 digit code.</Dialog.Description>
                <Dialog.Input onChangeText={(c) => setCode(c)} value={code}></Dialog.Input>
                <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
                <Dialog.Button label="Submit" onPress={handleSubmit} />
            </Dialog.Container>
        </View>
    );
};

const CheckCodeResult = {
    EVENT_NOT_FOUND: 0,
    ALREADY_CLAIMED: 1,
    SUCCESS: 2,
};

const checkCode = (code, events, uid) => {
    const event = Object.entries(events).find(([id, item]) => item.code == code);

    if (event == undefined) {
        return CheckCodeResult.EVENT_NOT_FOUND;
    }

    const [key, item] = event;

    if (item.users.includes(uid)) {
        return CheckCodeResult.ALREADY_CLAIMED;
    }

    return [CheckCodeResult.SUCCESS, event];
};

export const QRCodeScreen = ({ navigation }) => {
    const firebase = useFirebase();
    const firestore = useFirestore();

    useFirestoreConnect(["events"]);

    const events = useSelector((state) => state.firestore.data.events);
    const auth = useSelector((state) => state.firebase.auth);
    const [profileLoaded, profile] = useProfile();

    const [cameraPermission, setCameraPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    // Get camera permissions

    useEffect(() => {
        (async () => {
            const { status } = await Permissions.askAsync(Permissions.CAMERA);
            setCameraPermission(status === "granted");
        })();
    });

    if (cameraPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }

    if (cameraPermission === false) {
        return (
            <View style={styles.nocamera}>
                <Text>No access to camera</Text>
                <Button
                    title={"Click here to allow camera access"}
                    onPress={() => Linking.openURL("app-settings:")}
                />
            </View>
        );
    }

    // Handle code

    const handleCode = (code) => {
        const [status, [id]] = checkCode(parseInt(code), events, auth.uid);

        if (status == CheckCodeResult.EVENT_NOT_FOUND) {
            Alert.alert(
                "Event Not Found",
                "There is no event with that code.",
                [{ text: "OK", onPress: () => setScanned(false) }],
                { cancelable: false }
            );
        }

        if (status == CheckCodeResult.ALREADY_CLAIMED) {
            Alert.alert(
                "Already Claimed",
                "You have already claimed points for this event.",
                [{ text: "OK", onPress: () => setScanned(false) }],
                { cancelable: false }
            );
        }

        if (status == CheckCodeResult.SUCCESS) {
            if (events[id].type == "ASB") {
                firebase.updateProfile({
                    asbPoints: profile.asbPoints + events[id].points,
                });
            } else {
                firebase.updateProfile({
                    classPoints: profile.classPoints + events[id].points,
                });
            }

            firestore.update(
                {
                    collection: "events",
                    doc: id,
                },
                {
                    users: firestore.FieldValue.arrayUnion(auth.uid),
                }
            );

            Alert.alert(
                "Success!",
                `Thanks for coming! You received ${events[id].points} Spirit Points.`,
                [{ text: "OK", onPress: () => navigation.navigate("Home") }],
                { cancelable: false }
            );
        }
    };

    // Handle barcode scanned

    const handleBarCodeScanned = ({ data }) => {
        setScanned(true);

        if (data.match(/^lhs:\/\/([0-9]{6})$/)) {
            const code = data.substring(6);
            handleCode(code);
        } else {
            Alert.alert(
                "Invalid Code",
                "This QR code is not a valid code.",
                [{ text: "OK", onPress: () => setScanned(false) }],
                { cancelable: false }
            );
        }
    };

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={styles.scanner}
            />
            <EnterManuallyButton onSubmit={handleCode} />
        </View>
    );
};

QRCodeScreen.navigationOptions = {
    title: "Scan QR Code",
};

export default QRCodeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0F0F0",
        flexDirection: "column",
    },
    scanner: {
        flex: 1,
    },
});
