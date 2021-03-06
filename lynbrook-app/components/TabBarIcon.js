import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Colors } from "react-native-ui-lib";


export default function TabBarIcon(props) {
    return (
        <Ionicons
            name={props.name}
            size={26}
            style={{ marginBottom: -3 }}
            color={props.focused ? Colors.blue20 : Colors.dark60}
        />
    );
}
