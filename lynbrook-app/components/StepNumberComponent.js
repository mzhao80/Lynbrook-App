import { Text, Button } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import React from "react";

export const StepNumberComponent = ({
    isFirstStep,
    isLastStep,
    currentStep,
    currentStepNumber
}) => {
    return (
        <View style={styles.stepNumber}>
            <Text style={[styles.stepNumberText]}>{currentStepNumber}</Text>
        </View>
    )
};

export default StepNumberComponent;

const styles = StyleSheet.create({
    stepNumber: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        borderColor: '#FFFFFF',
        backgroundColor: '#3399FF',
    },
    stepNumberText: {
        fontSize: 10,
        backgroundColor: 'transparent',
        color: '#FFFFFF',
    },
});