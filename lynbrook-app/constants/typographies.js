import { Platform } from "react-native";
import { Colors } from "react-native-ui-lib";

export default {
    text10: {
        fontSize: 64,
    },
    text20: {
        fontSize: 50,
    },
    text30: {
        fontSize: 36,
    },
    text40: {
        fontSize: 28,
    },
    text50: {
        fontSize: Platform.OS === "android" ? 24 : 22,
    },
    text60: {
        fontSize: 20,
    },
    text70: {
        fontSize: Platform.OS === "android" ? 16 : 17,
    },
    text80: {
        fontSize: Platform.OS === "android" ? 14 : 15,
    },
    text90: {
        fontSize: Platform.OS === "android" ? 12 : 13,
    },
    text100: {
        fontSize: Platform.OS === "android" ? 10 : 11,
    },
    h1: {
        fontWeight: "bold",
        fontSize: 20,
    },
    h2: {
        fontWeight: "bold",
        fontSize: 16,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.dark30,
    },
};
