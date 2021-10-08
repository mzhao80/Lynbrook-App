import { Input } from "@ui-kitten/components";
import React, { useState } from "react";
import { Alert, Button, Keyboard, KeyboardAvoidingView, StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Text, View } from "react-native-ui-lib";
import { useFirebase } from "react-redux-firebase";

const login = async (firebase, email, password) => {
    try {
        await firebase.login({
            email,
            password,
        });
    } catch (err) {
        Alert.alert("Error", err.message);
    }
};

export const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [passport, setPassport] = useState("");
    const firebase = useFirebase();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Text style={styles.heading}>Guest Login</Text>

                <Input
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    textContentType="emailAddress"
                />
                <Input
                    placeholder="Password"
                    value={passport}
                    onChangeText={setPassport}
                    secureTextEntry
                />
            </TouchableWithoutFeedback>

            <View style={{ marginTop: 10 }}>
                <Button
                    title="Sign in as Guest"
                    onPress={login.bind(null, firebase, email, passport)}
                />
            </View>
            <View
                style={{
                    borderTopColor: "#DDDDDD",
                    borderTopWidth: 1,
                    marginTop: 10,
                    paddingTop: 10,
                }}
            >
                <Button
                    title="First time? Register here"
                    onPress={navigation.navigate.bind(null, "Register")}
                />
            </View>
            <View style={{ marginTop: 5 }}>
                <Button title="Go back" onPress={navigation.goBack} />
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

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
