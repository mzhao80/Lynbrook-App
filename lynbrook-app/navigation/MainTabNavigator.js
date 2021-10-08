import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Platform } from "react-native";
import TabBarIcon from "../components/TabBarIcon";
import AnnouncementDetailScreen from "../screens/announcements/AnnouncementDetailScreen";
import AnnouncementsScreen from "../screens/announcements/AnnouncementsScreen";
import EventsScreen from "../screens/events/EventsScreen";
import BarcodeScreen from "../screens/home/BarcodeScreen";
import HomeScreen from "../screens/home/HomeScreen";
import SpecialEventScreen from "../screens/home/SpecialEventScreen";
import QRCodeScreen from "../screens/home/QRCodeScreen";
import RewardsScreen from "../screens/home/RewardsScreen";
import ActivitiesScreen from "../screens/activities/ActivitiesScreen";
import ClubsScreen from "../screens/activities/ClubsScreen";
import ClubsDetailScreen from "../screens/activities/ClubsDetailScreen";
import SettingsScheduleScreen from "../screens/settings/SettingsScheduleScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import { Text } from "react-native";

const config = {
    screenOptions: {
        headerStyle: {
            backgroundColor: "#043265",
        },
        headerTintColor: "#fff",
    },
};

const AnnouncementsStack = createStackNavigator();

const Announcements = () => (
    <AnnouncementsStack.Navigator {...config}>
        <AnnouncementsStack.Screen name="Announcements" component={AnnouncementsScreen} />
        <AnnouncementsStack.Screen name="Detail" component={AnnouncementDetailScreen} />
    </AnnouncementsStack.Navigator>
);

// AnnouncementsStack.navigationOptions = {
//     tabBarLabel: "News",
//     tabBarIcon: ({ focused }) => (
//         <TabBarIcon focused={focused} name="newspaper" />
//     ),
// };

const ActivitiesStack = createStackNavigator();

const Activities = () => (
    <ActivitiesStack.Navigator {...config}>
        <ActivitiesStack.Screen name="Activities" component={ActivitiesScreen} />
        <ActivitiesStack.Screen name="Clubs" component={ClubsScreen} />
        <ActivitiesStack.Screen name="Detail" component={ClubsDetailScreen} />
    </ActivitiesStack.Navigator>
);

// ScheduleStack.navigationOptions = {
//     tabBarLabel: "Schedule",
//     tabBarIcon: ({ focused }) => (
//         <TabBarIcon focused={focused} name={Platform.OS === "ios" ? "ios-time" : "md-time"} />
//     ),
// };

const HomeStack = createStackNavigator();

const Home = () => (
    <HomeStack.Navigator {...config}>
        <HomeStack.Screen name="Home" component={HomeScreen} />
        <HomeStack.Screen name="QRCode" component={QRCodeScreen} />
        <HomeStack.Screen name="Rewards" component={RewardsScreen} />
        <HomeStack.Screen name="Barcode" component={BarcodeScreen} />
        <HomeStack.Screen name="Special" component={SpecialEventScreen} />
    </HomeStack.Navigator>
);

// HomeStack.navigationOptions = {
//     tabBarLabel: "Home",
//     tabBarIcon: ({ focused }) => (
//         <TabBarIcon focused={focused} name={Platform.OS === "ios" ? "ios-home" : "md-home"} />
//     ),
// };

const EventsStack = createStackNavigator();

const Events = () => (
    <EventsStack.Navigator {...config}>
        <EventsStack.Screen name="Events" component={EventsScreen} />
    </EventsStack.Navigator>
);

// EventsStack.navigationOptions = {
//     tabBarLabel: "Events",
//     tabBarIcon: ({ focused }) => (
//         <TabBarIcon
//             focused={focused}
//             name={Platform.OS === "ios" ? "ios-megaphone" : "md-megaphone"}
//         />
//     ),
// };

const SettingsStack = createStackNavigator();

const Settings = () => (
    <SettingsStack.Navigator {...config}>
        <SettingsStack.Screen name="Settings" component={SettingsScreen} />
        <SettingsStack.Screen name="Schedule" component={SettingsScheduleScreen} />
    </SettingsStack.Navigator>
);

// SettingsStack.navigationOptions = {
//     tabBarLabel: "Settings",
//     tabBarIcon: ({ focused }) => (
//         <TabBarIcon focused={focused} name={Platform.OS === "ios" ? "ios-options" : "md-options"} />
//     ),
// };

const tabBarIcons = {
    AnnouncementsStack: Platform.OS === "newspaper",
    ActivitiesStack: Platform.OS === "time",
    HomeStack: Platform.OS === "home",
    EventsStack: Platform.OS === "megaphone",
    SettingsStack: Platform.OS === "options",
};

const tabBarOptions = {
    screenOptions: ({ route }) => ({
        ...config.screenOptions,
        tabBarIcon: ({ focused }) => {
            const iconName = tabBarIcons[route.name];
            return <TabBarIcon focused={focused} name={iconName} />;
        },
    }),
};

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
    <Tab.Navigator {...tabBarOptions} initialRouteName="HomeStack">
        <Tab.Screen
            name="AnnouncementsStack"
            component={Announcements}
            options={{ tabBarLabel: "News" }}
        />
        <Tab.Screen
            name="ActivitiesStack"
            component={Activities}
            options={{ tabBarLabel: "Activities" }}
        />
        <Tab.Screen name="HomeStack" component={Home} options={{ tabBarLabel: "Home" }} />
        <Tab.Screen name="EventsStack" component={Events} options={{ tabBarLabel: "Events" }} />
        <Tab.Screen
            name="SettingsStack"
            component={Settings}
            options={{ tabBarLabel: "Settings" }}
        />
    </Tab.Navigator>
);

export default MainTabNavigator;
