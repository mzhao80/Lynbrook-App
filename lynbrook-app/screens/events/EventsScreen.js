import ical from "cal-parser";
import moment from "moment-timezone";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, AsyncStorage, StyleSheet, Text, View, Platform } from "react-native";
import { Agenda } from "react-native-calendars";
import { useSelector } from "react-redux";
import { isLoaded, useFirestoreConnect } from "react-redux-firebase";
import { useProfile } from "../../helpers/profile";
import * as Calendar from "expo-calendar";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import TooltipComponent from "../../components/TooltipComponent";
import StepNumberComponent from "../../components/StepNumberComponent";
import { storeData, getData } from "../../helpers/asyncStorage";

const WalkthroughableView = walkthroughable(View);

export const EventItem = ({ item }) => {
    return (
        <View style={[styles.event, styles[item.calendar] || styles.clubs]}>
            <Text>{item.name}</Text>
            <Text style={{ color: "#808080" }}>
                {item.starttime.hour() == 0 && item.endtime.hour() == 0
                    ? "All Day"
                    : item.starttime.format("hh:mm A") + " – " + item.endtime.format("hh:mm A")}
            </Text>
        </View>
    );
};

const fetchCalendar = async (url) => {
    // Download and parse
    let response = await fetch(url);
    response = await response.text();

    const parsed = ical.parseString(response);

    // Have no idea what this does, but it seems to be important
    let events = parsed.events.filter(
        (item, idx) => parsed.events.findIndex((item2) => item2.uid.value == item.uid.value) == idx
    );

    // Sort
    events = events.sort(
        (a, b) => moment(a.dtstart.value).valueOf() - moment(b.dtstart.value).valueOf()
    );

    return events;
};

const downloadCalendars = async (profile, authors) => {
    // Retrieve calendars for LHS, sports, and ASB

    const events = await fetchCalendar(
        "https://calendar.google.com/calendar/ical/fuhsd.org_lh543sfcavjia3t4tqdrs5227k%40group.calendar.google.com/public/basic.ics"
    );
    const sevents = await fetchCalendar(
        "https://calendar.google.com/calendar/ical/lhs_athletic%40fuhsd.org/public/basic.ics"
    );
    const asbevents = await fetchCalendar(
        "https://calendar.google.com/calendar/ical/qd1epm3o57ns1e5umjq6hfnric%40group.calendar.google.com/public/basic.ics"
    );

    // Retrieve club calendars

    const clubevents = {};

    if (profile != null) {
        for (const value of Object.values(profile.subscribed)) {
            if (authors[value.id].calendar !== undefined) {
                clubevents[value.id] = await fetchCalendar(authors[value.id].calendar);
            }
        }
    }

    // Store calendars in AsyncStorage

    await Promise.all([
        storeData("events", events),
        storeData("sevents", sevents),
        storeData("asbevents", asbevents),
        storeData("clubevents", clubevents),
    ]);

    // Return items

    return {
        main: events,
        sports: sevents,
        asb: asbevents,
        ...clubevents,
    };
};

const getEvents = async (profile, authors) => {
    // Check to see if previously saved
    const events = await getData("events");
    const sevents = await getData("sevents");
    const asbevents = await getData("asbevents");
    const clubevents = await getData("clubevents");

    if (events !== null && sevents !== null && asbevents !== null && clubevents !== null) {
        downloadCalendars(profile, authors);

        // Return saved list
        return {
            main: events,
            sports: sevents,
            asb: asbevents,
            ...clubevents,
        };
    } else {
        // Fetch list and return
        return await downloadCalendars(profile, authors);
    }
};

const getNewItems = async (prevItems, day, events) => {
    const items = prevItems;
    const toLoad = [];

    // Load events 40 days before to 40 days after
    // Only need to update days without data

    let current = moment(day.timestamp);
    current.day(current.day() - 40);
    for (let i = 0; i < 80; i++) {
        const time = current.format("YYYY-MM-DD");
        if (!items[time] || items[time].length == 0) {
            toLoad.push(time);
            items[time] = [];
        }
        current.day(current.day() + 1);
    }

    let granted = true;
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status != 'granted') {
        granted = false;
    }
    if (Platform.OS === "ios") {
        const { status } = await Calendar.requestRemindersPermissionsAsync();
        if (status != 'granted') {
            granted = false;
        }
    }
    if (granted) {
        const cal = await Calendar.getCalendarsAsync();
        const calendarIDs = cal.map((calendar) => calendar.id);
        const start = new Date();
        const e = await Calendar.getEventsAsync(
            calendarIDs,
            new Date(start.setDate(start.getDate())),
            new Date(start.setDate(start.getDate() + 40))
        );
        events.system = e;
    }

    // Loop through calendars and check for events

    for (const [key, calendar] of Object.entries(events)) {
        let events;
        if (key == "system") {
            events = calendar;
        } else {
            events = calendar.filter(
                (event) => current.diff(moment(event.dtstart.value), "days") <= 40
            );
        }

        for (const event of events) {
            // Only update if needed
            let timestamp;
            if (key == "system") {
                timestamp = moment(event.startDate).format("YYYY-MM-DD");
            } else {
                timestamp = moment(event.dtstart.value).format("YYYY-MM-DD");
            }
            if (toLoad.includes(timestamp)) {
                if (key == "system") {
                    if (event.allDay) {
                        const date = moment(event.startDate).format("YYYY-MM-DD");
                        const e = {
                            name: event.title,
                            starttime: moment(event.startDate),
                            endtime: moment(event.startDate),
                            calendar: key,
                        };
                        if (
                            items[date] != undefined &&
                            !items[date].some((item) => isEquivalent(item, e))
                        ) {
                            items[date].push(e);
                        }
                    } else {
                        const e = {
                            name: event.title,
                            starttime: moment(event.startDate),
                            endtime: moment(event.endDate),
                            calendar: key,
                        };
                        if (!items[timestamp].some((item) => isEquivalent(item, e))) {
                            items[timestamp].push(e);
                        }
                    }
                } else if (event.dtend != null) {
                    const iterations =
                        moment(event.dtend.value).diff(moment(event.dtstart.value), "days") - 1;
                    for (let i = 1; i <= iterations; i++) {
                        const date = moment(event.dtstart.value)
                            .add(i, "days")
                            .format("YYYY-MM-DD");
                        const e = {
                            name: event.summary.value,
                            starttime: moment(event.dtstart.value).add(i, "days"),
                            endtime: moment(event.dtend.value).add(i + 1, "days"),
                            calendar: key,
                        };
                        if (
                            items[date] != undefined &&
                            !items[date].some((item) => isEquivalent(item, e))
                        ) {
                            items[date].push(e);
                        }
                    }
                    const date = moment(event.dtstart.value).format("YYYY-MM-DD");
                    const e = {
                        name: event.summary.value,
                        starttime: moment(event.dtstart.value),
                        endtime: moment(event.dtend.value),
                        calendar: key,
                    };
                    if (
                        items[date] != undefined &&
                        !items[date].some((item) => isEquivalent(item, e))
                    ) {
                        items[date].push(e);
                    }
                } else {
                    const e = {
                        name: event.summary.value,
                        starttime: moment(event.dtstart.value),
                        endtime: moment(event.dtstart.value),
                        calendar: key,
                    };
                    if (!items[timestamp].some((item) => isEquivalent(item, e))) {
                        items[timestamp].push(e);
                    }
                }
            }
        }
    }
    return items;
};

const isEquivalent = (a, b) => {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] != b[propName]) {
            if (typeof a[propName] == "object") {
                if (a[propName].diff(b[propName]) > 0) {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
};

export const EventsScreen = ({ navigation, start, copilotEvents }) => {
    useFirestoreConnect([
        "authors",
        {
            collection: "announcements",
            orderBy: [["date", "desc"]],
        },
    ]);

    const authors = useSelector((state) => state.firestore.data.authors);
    const [profileLoaded, profile] = useProfile();

    const [events, setEvents] = useState({});
    const [items, setItems] = useState({});
    const [loaded, setLoaded] = useState(false);
    const [key, setKey] = useState(false);
    // const firebase = useFirebase();

    useEffect(() => {
        let tour = async () => {
            const tours = await getData("tours")
            if (!tours.includes("Events")) {
                start()
                copilotEvents.on("stop", async () => {
                    tours.push("Events")
                    await storeData("tours", tours)
                })
                copilotEvents.on("skip", async () => {
                    tours.push("Events")
                    await storeData("tours", tours)
                })
            }
        }
        tour()
    }, []);

    const _getEvents = async () => {
        return await getEvents(profile, authors);
    };

    const _loadItemsForMonth = async (day) => {
        let newEvents = null;
        if (!loaded) {
            newEvents = await _getEvents();
            setEvents(events);
            setLoaded(true);
        }
        setItems(await getNewItems(items, day, newEvents ?? events));
        if (!key) setKey(true);
    };

    // Loading screen

    if (!profileLoaded || !isLoaded(authors)) {
        return (
            <View style={styles.container} paddingT-15>
                <ActivityIndicator accessibilityLabel="Loading" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CopilotStep text="See all LHS, ASB, and Club calendars integrated here (allow calendar access to see how your personal calendar fits in as well)." order={1} name="Calendar">
                <WalkthroughableView>
                </WalkthroughableView>
            </CopilotStep>
            <Agenda
                key={key}
                items={items}
                loadItemsForMonth={_loadItemsForMonth}
                selected={moment().format("YYYY-MM-DD")}
                renderItem={(item) => <EventItem item={item} />}
                renderEmptyDate={() => <View style={styles.emptyDate}></View>}
                rowHasChanged={(r1, r2) => r1.name != r2.name}
                refreshing={!loaded}
            />
        </View>
    );
};

EventsScreen.navigationOptions = {
    title: "Events",
};

export default copilot({
    stepNumberComponent: StepNumberComponent,
    tooltipComponent: TooltipComponent,
    androidStatusBarVisible: Platform.OS != "ios"
})(EventsScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    listitemwrapper: {
        borderBottomWidth: 0.3,
        borderBottomColor: "#CCCCCC",
    },
    listitem: {
        padding: 15,
    },
    event: {
        backgroundColor: "white",
        flex: 1,
        borderRadius: 5,
        padding: 10,
        flexDirection: "column",
        justifyContent: "center",
        marginRight: 10,
        marginTop: 17,
        shadowColor: "black",
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    main: {
        borderLeftColor: "#E74C3C",
        borderLeftWidth: 5,
    },
    sports: {
        borderLeftColor: "#1090FF",
        borderLeftWidth: 5,
    },
    system: {
        borderLeftColor: "#000080",
        borderLeftWidth: 5,
    },
    clubs: {
        borderLeftColor: "#89CFF0",
        borderLeftWidth: 5,
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30,
    },
});
