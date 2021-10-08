import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Text, View } from "react-native-ui-lib";

export const BarcodeScreen = ({ route }) => {
    const id = route.params?.id ?? {};
    const uid = route.params?.uid ?? {};

    return (
        <View style={styles.container}>
            <Text subtitle center marginB-20>
                Please show an ASB Officer the following QR Code to receive
                your prize.
            </Text>
            <View>
                <QRCode
                    size={Dimensions.get("window").width - 30}
                    value={`${id}-${uid}`}
                    backgroundColor="transparent"
                />
            </View>
        </View>
    );
};

BarcodeScreen.navigationOptions = {
    title: "Redeem Reward",
};

export default BarcodeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0F0F0",
        padding: 15,
        justifyContent: "center",
    },
});
