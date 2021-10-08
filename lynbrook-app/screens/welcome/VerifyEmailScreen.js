import React from "react";
import { Alert, Button, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text, View } from "react-native-ui-lib";
import { useSelector } from "react-redux";
import { useFirebase } from "react-redux-firebase";

export const VerifyEmailScreen = () => {
    const firebase = useFirebase();
    const auth = useSelector((state) => state.firebase.auth);

    const verifyEmail = async () => {
        try {
            await firebase.auth().currentUser.sendEmailVerification();
            Alert.alert("Email has been sent!");
        } catch (err) {
            Alert.alert(err.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Verify Email</Text>
            <Text style={{ textAlign: "center" }}>
                Welcome, {auth.email}. Please click the verification link sent to your email, then
                come back and press the "Check Verification" button.
            </Text>

            <View style={{ marginTop: 15 }}>
                <Button title="Check Verification" onPress={firebase.reloadAuth} />
            </View>
            <View
                style={{
                    borderTopColor: "#DDDDDD",
                    borderTopWidth: 1,
                    marginTop: 10,
                    paddingTop: 10,
                }}
            >
                <Button title="Resend Email" onPress={verifyEmail} />
            </View>
            <View style={{ marginTop: 5 }}>
                <Button title="Sign Out" onPress={firebase.logout} />
            </View>
        </ScrollView>
    );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        flexDirection: "column",
        padding: 30,
    },
    heading: {
        fontWeight: "bold",
        fontSize: 30,
        marginBottom: 20,
        textAlign: "center",
    },
});
