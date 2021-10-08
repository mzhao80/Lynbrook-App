import React from "react";
import { Button, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";
import { useFirebase } from "react-redux-firebase";

export const CompleteSetupScreen = ({ navigation }) => {
    const firebase = useFirebase();

    const setupDone = async () => {
        firebase.updateProfile({
            setup: true,
        });
    }


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View paddingH-30>
                <Text style={styles.heading} marginB-5 center>
                    You're all set!
                </Text>
            </View>

            <Button title="Let's go!" onPress={setupDone} />
        </ScrollView>
    );
};

export default CompleteSetupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        flexDirection: "column",
    },
    heading: {
        fontWeight: "bold",
        fontSize: 30,
    },
});
