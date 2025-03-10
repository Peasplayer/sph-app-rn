import {StyleSheet} from "react-native";
import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {Button, Text} from "react-native-paper";

export default function Home() {
    return (
        <SafeAreaView
            style={styles.container}
        >
            <Text style={{margin: 15, fontWeight: "bold"}} variant={"titleLarge"}>SPH+</Text>
            <Button
                style={{width: "60%", margin: 5}}
                icon="timer-sand"
                mode={"contained"}
                onPress={() => router.navigate("/schedule")}
            >Stundenplan</Button>
            <Button
                style={{width: "60%", margin: 5}}
                icon="book-account-outline"
                mode={"contained"}
                onPress={() => router.navigate("/substitution")}
            >Vertretungsplan</Button>
            <Button
                style={{width: "60%", margin: 5}}
                icon="message-text-outline"
                mode={"contained"}
                onPress={() => router.navigate("/messages")}
            >Nachrichten</Button>
            <Button
                style={{width: "60%", margin: 5}}
                icon="login"
                mode={"contained"}
                onPress={() => router.navigate("/login")}
            >Login</Button>
            <Button
                style={{marginTop: 20}}
                icon="slide"
                mode={"elevated"}
                onPress={() => router.navigate("/test")}
            >Playground (Nicht benutzen)</Button>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
