import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, ScrollView } from "react-native";
import { ListItem, Text, ThemeManager, View } from "react-native-ui-lib";
import { useFirebase } from "react-redux-firebase";
import { useProfile } from "../helpers/profile";

export const ScheduleEditor = forwardRef((props, ref) => {
    const firebase = useFirebase();

    const [profileLoaded, profile] = useProfile();

    const [loaded, setLoaded] = useState(false);
    const [state, setState] = useState({});

    useImperativeHandle(ref, () => ({
        updateValues: () => {
            firebase.updateProfile({
                periods: state,
            });
        },
    }));

    if (profileLoaded && !loaded) {
        setState({
            p1: "",
            p2: "",
            p3: "",
            p4: "",
            p5: "",
            p6: "",
            p7: "",
            ...profile.periods,
        });
        setLoaded(true);
    }

    if (!loaded) {
        return (
            <View style={styles.container} paddingT-15>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    return (
        <View>
            <View style={styles.bordertop} />
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <ListItem height="auto" containerStyle={styles.border} key={n}>
                    <ListItem.Part paddingH-20 paddingV-15 middle>
                        <Text text80>Period {n}</Text>
                        <TextInput
                            style={styles.textinput}
                            onChangeText={(text) => setState({ ...state, [`p${n}`]: text })}
                            value={state[`p${n}`]}
                            flex={1}
                        />
                    </ListItem.Part>
                </ListItem>
            ))}
        </View>
    );
});

export default ScheduleEditor;

const styles = StyleSheet.create({
    border: {
        borderBottomWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
    },
    bordertop: {
        borderTopWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
     },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 3,
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
        // padding: 15,
        minHeight: 50,
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    textinput: {
        textAlign: "right",
        flexGrow: 1,
        marginLeft: 15,
        color: "#7F7F7F",
    },
});
