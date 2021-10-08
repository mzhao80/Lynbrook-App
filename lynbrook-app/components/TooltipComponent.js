import { Button, Text } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import React from "react";

export const TooltipComponent = ({
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrev,
    handleStop,
    currentStep,
    labels
}) => {
    return (
        <View>
            <View style={styles.tooltipContainer}>
                <Text testID="stepDescription" style={styles.tooltipText}>{currentStep.text}</Text>
            </View>
            <View style={[styles.bottomBar]}>
            {
                !isFirstStep ?
                <Button appearance="ghost" onPress={handlePrev}>{labels.previous || 'Previous'}</Button>
                : null
            }
            {
                !isLastStep ?
                <Button appearance="ghost" onPress={handleNext}>{labels.next || 'Next'}</Button>
                :
                <Button appearance="ghost" onPress={handleStop}>{labels.finish || 'Finish'}</Button>
            }
            </View>
        </View>
    )
}

export default TooltipComponent;

const styles = StyleSheet.create({
    tooltipContainer: {
        flex: 1,
    },
    bottomBar: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
});