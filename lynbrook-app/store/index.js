import { decode, encode } from "base-64";
import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import { firebaseReducer } from "react-redux-firebase";
import { combineReducers, createStore } from "redux";
import { createFirestoreInstance, firestoreReducer } from "redux-firestore";
import { firebase as fbConfig } from "./config";

if (!global.btoa) {
    global.btoa = encode;
}
if (!global.atob) {
    global.atob = decode;
}

export const rrfConfig = {
    userProfile: "users",
    useFirestoreForProfile: true,
};

firebase.initializeApp(fbConfig);

const rootReducer = combineReducers({
    firestore: firestoreReducer,
    firebase: firebaseReducer,
});

const initialState = {};
export default store = createStore(rootReducer, initialState);

export const rrfProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance,
};
