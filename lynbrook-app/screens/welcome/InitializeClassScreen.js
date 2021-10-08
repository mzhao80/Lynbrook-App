import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Button, Platform, ScrollView, StyleSheet } from "react-native";
import { Colors, ListItem, Text, ThemeManager, View } from "react-native-ui-lib";
import { connect } from "react-redux";
import { firebaseConnect, firestoreConnect } from "react-redux-firebase";
import { compose } from "redux";

export class InitializeClassScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 2022,
        };
        if (!props.profile.email) {
            props.firebase.logout();
        }
    }

    set(v) {
        this.setState({
            selected: v,
        });
    }

    nextScreen() {
        this.props.firebase.updateProfile({
            class: this.state.selected,
            subscribed: [this.props.firestore.doc("/authors/lhs"), this.props.firestore.doc("/authors/asb"), this.props.firestore.doc(`/authors/co${this.state.selected}`)],
        });
        this.props.navigation.navigate("InitializeSchedule");
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <View paddingH-30>
                    <Text style={styles.heading} marginB-5>
                        {`Welcome, \n${this.props.profile.displayName}`}
                    </Text>
                    <Text text60>Select your class:</Text>
                </View>

                <View marginV-30>
                    <ListItem
                        height="auto"
                        containerStyle={[styles.border, styles.bordertop]}
                        activeBackgroundColor={Colors.dark70}
                        onPress={() => this.set(2024)}
                    >
                        <ListItem.Part paddingH-20 middle>
                            <ListItem.Part paddingV-15>
                                <Text text80>Class of 2024 (Freshmen)</Text>
                            </ListItem.Part>
                            {this.state.selected == 2024 && (
                                <Ionicons
                                    color={Colors.blue10}
                                    size={23}
                                    style={styles.detailArrow}
                                    name="checkmark"
                                />
                            )}
                        </ListItem.Part>
                    </ListItem>

                    <ListItem
                        height="auto"
                        containerStyle={styles.border}
                        activeBackgroundColor={Colors.dark70}
                        onPress={() => this.set(2023)}
                    >
                        <ListItem.Part paddingH-20 middle>
                            <ListItem.Part paddingV-15>
                                <Text text80>Class of 2023 (Sophomores)</Text>
                            </ListItem.Part>
                            {this.state.selected == 2023 && (
                                <Ionicons
                                    color={Colors.blue10}
                                    size={23}
                                    style={styles.detailArrow}
                                    name="checkmark"
                                />
                            )}
                        </ListItem.Part>
                    </ListItem>

                    <ListItem
                        height="auto"
                        containerStyle={styles.border}
                        activeBackgroundColor={Colors.dark70}
                        onPress={() => this.set(2022)}
                    >
                        <ListItem.Part paddingH-20 middle>
                            <ListItem.Part paddingV-15>
                                <Text text80>Class of 2022 (Juniors)</Text>
                            </ListItem.Part>
                            {this.state.selected == 2022 && (
                                <Ionicons
                                    color={Colors.blue10}
                                    size={23}
                                    style={styles.detailArrow}
                                    name="checkmark"
                                />
                            )}
                        </ListItem.Part>
                    </ListItem>

                    <ListItem
                        height="auto"
                        containerStyle={styles.border}
                        activeBackgroundColor={Colors.dark70}
                        onPress={() => this.set(2021)}
                    >
                        <ListItem.Part paddingH-20 middle>
                            <ListItem.Part paddingV-15>
                                <Text text80>Class of 2021 (Seniors)</Text>
                            </ListItem.Part>
                            {this.state.selected == 2021 && (
                                <Ionicons
                                    color={Colors.blue10}
                                    size={23}
                                    style={styles.detailArrow}
                                    name="checkmark"
                                />
                            )}
                        </ListItem.Part>
                    </ListItem>
                </View>
                <View paddingH-30 marginB-20>
                    <Text subtitle>
                        This setting is permanent and cannot be changed in settings, so please
                        choose your class correctly. For staff, please select a class you would like to receive announcements for.
                    </Text>
                </View>

                <Button title="Next" onPress={this.nextScreen.bind(this)} />
            </ScrollView>
        );
    }
}

export default compose(
    firebaseConnect([]),
    firestoreConnect([]),
    connect(({ firebase }) => {
        return {
            auth: firebase.auth,
            profile: firebase.profile,
        };
    })
)(InitializeClassScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        flexDirection: "column",
    },
    border: {
        borderBottomWidth: 2 * StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
    },
    bordertop: {
        borderTopWidth: 2 * StyleSheet.hairlineWidth,
    },
    heading: {
        fontWeight: "bold",
        fontSize: 30,
    },
});
