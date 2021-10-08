import { AsyncStorage } from "react-native";

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Error saving data, but it's okay
    }
};

export const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) return JSON.parse(value);
    } catch (error) {
        // Error retrieving data
    }

    return null;
};