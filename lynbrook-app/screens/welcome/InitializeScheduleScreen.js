import React from "react";
import {
    Button,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { Text, ThemeManager, View } from "react-native-ui-lib";
import { connect } from "react-redux";
import { firebaseConnect } from "react-redux-firebase";
import { compose } from "redux";
import ScheduleEditor from "../../components/ScheduleEditor";

export class InitializeScheduleScreen extends React.Component {
    constructor(props) {
        super(props);
        this.seRef = React.createRef();
    }

    nextScreen() {
        this.seRef.current.updateValues();
        this.props.navigation.navigate("CompleteSetup");
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.container}>
                        <View paddingH-30>
                            <Text style={styles.heading} marginB-5>
                                Thanks, {this.props.profile.displayName.split(" ")[0]}.
                            </Text>
                            <Text text60>Enter your schedule</Text>
                        </View>

                        <View paddingH-30 marginT-20>
                            <Text title style={{ fontWeight: "bold" }}>
                                This can be changed later in settings. If you wish to include your
                                schedule later, press Next now.
                            </Text>
                        </View>

                        <View marginV-30>
                            <ScheduleEditor
                                ref={this.seRef}
                                firebase={this.props.firebase}
                                profile={this.props.profile}
                            />
                        </View>

                        <Button title="Next" onPress={this.nextScreen.bind(this)} />
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        );
    }
}

export default compose(
    firebaseConnect([]),
    connect(({ firebase: { auth, profile } }) => {
        return {
            auth,
            profile,
        };
    })
)(InitializeScheduleScreen);

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
