import React, { useState, useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Button, Card, Text, View } from "react-native-ui-lib";
import { useSelector } from "react-redux";
import { isLoaded, useFirestoreConnect, useFirebase } from "react-redux-firebase";
import { useProfile } from "../../helpers/profile";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import TooltipComponent from "../../components/TooltipComponent";
import StepNumberComponent from "../../components/StepNumberComponent";
import { storeData, getData } from "../../helpers/asyncStorage";

const WalkthroughableView = walkthroughable(View);

export const RewardListItem = ({ item, disabled, onRedeem, tour }) => {
    if (tour) {
        return (
            <Card padding-20 key={item} marginB-15>
                <View marginB-20 row>
                    <View flex>
                        <Text style={styles.heading} h1 marginB-3>
                            {item.title}
                        </Text>
                        <Text style={styles.description} subtitle>
                            {item.description}
                        </Text>
                    </View>
                    <CopilotStep text={`Each reward requires a certain number of spirit points to be redeemed. This reward needs ${item.points} points.`} order={2} name="Points">
                        <WalkthroughableView>
                            <Text text40>{item.points}</Text>
                        </WalkthroughableView>
                    </CopilotStep>
                </View>
                <CopilotStep text="Once you've obtained enough spirit points, you can obtain your reward here. Earn spirit points by participating in ASB/Class activities!" order={3} name="Redeem">
                    <WalkthroughableView>
                        <Button label="Redeem" h2 onPress={onRedeem} disabled={disabled} />
                    </WalkthroughableView>
                </CopilotStep>
            </Card>
        )
    } else {
        return (
            <Card padding-20 key={item} marginB-15>
                <View marginB-20 row>
                    <View flex>
                        <Text style={styles.heading} h1 marginB-3>
                            {item.title}
                        </Text>
                        <Text style={styles.description} subtitle>
                            {item.description}
                        </Text>
                    </View>
                    <View>
                        <Text text40>{item.points}</Text>
                    </View>
                </View>
                <Button label="Redeem" h2 onPress={onRedeem} disabled={disabled} />
            </Card>
        )
    }
};

export const RewardsScreen = ({ navigation, start, copilotEvents }) => {
    useFirestoreConnect([
        {
            collection: "prizes",
            orderBy: "points",
        },
    ]);

    const prizes = useSelector((state) => state.firestore.ordered.prizes);
    const [profileLoaded, profile] = useProfile();

    const auth = useSelector((state) => state.firebase.auth);

    const firebase = useFirebase();

    useEffect(() => {
        let tour = async () => {
            const tours = await getData("tours")
            if (!tours.includes("Rewards")) {
                setTimeout(() => {
                    start()
                }, 500)
                copilotEvents.on("stop", async () => {
                    tours.push("Rewards")
                    await storeData("tours", tours)
                })
                copilotEvents.on("skip", async () => {
                    tours.push("Rewards")
                    await storeData("tours", tours)
                })
            }
        }
        tour()
    }, []);

    if (!profileLoaded || !isLoaded(prizes)) {
        return (
            <View style={styles.container} paddingT-15>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <View padding-15>
                    <CopilotStep text="View your rewards here." order={1} name="Rewards">
                        <WalkthroughableView>
                        </WalkthroughableView>
                    </CopilotStep>
                    {prizes.map((item, index) => {
                        if (item.type == "ASB" || item.type == profile.class) {
                            return (
                                <RewardListItem
                                    key={item.id}
                                    item={item}
                                    tour={index == 0}
                                    disabled={(item.type == "ASB" ? profile.asbPoints : profile.classPoints) < item.points}
                                    onRedeem={() => {
                                        navigation.navigate("Barcode", {
                                            id: item.id,
                                            uid: auth.uid,
                                        });
                                    }}
                                />
                            )
                        }
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

RewardsScreen.navigationOptions = {
    title: "Rewards",
};

export default copilot({
    stepNumberComponent: StepNumberComponent,
    tooltipComponent: TooltipComponent,
    androidStatusBarVisible: Platform.OS != "ios"
})(RewardsScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0F0F0",
        flexDirection: "column",
    },
});
