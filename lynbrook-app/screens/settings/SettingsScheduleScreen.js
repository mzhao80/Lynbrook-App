import { useFocusEffect } from "@react-navigation/native";
import { Layout } from "@ui-kitten/components";
import React, { useCallback, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import ScheduleEditor from "../../components/ScheduleEditor";

const SettingsScheduleScreen = ({ navigation }) => {
    const seRef = useRef();

    useFocusEffect(
        useCallback(() => {
            return () => {
                seRef.current && seRef.current.updateValues();
            };
        }, [])
    );

    return (
        <Layout level="3" style={styles.container}>
            <ScrollView>
                <ScheduleEditor ref={seRef} />
            </ScrollView>
        </Layout>
    );
};

SettingsScheduleScreen.navigationOptions = {
    title: "Schedule Settings",
    headerStyle: {
        backgroundColor: "#043265",
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
        fontWeight: "bold",
    },
};

export default SettingsScheduleScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
