import {Pressable, StyleSheet} from "react-native";
import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {Button, Text, useTheme} from "react-native-paper";
import Cache from "@/lib/Cache";
import * as SecureStore from "expo-secure-store";

export default function Home() {
    const theme = useTheme();

    const [clicker, setClicker] = React.useState<number>(0);

    return (
        <SafeAreaView
            style={[styles.container, {backgroundColor: theme.colors.background}]}
        >
            <Pressable onPress={() => {setClicker(clicker + 1)}}>
                <Text style={{margin: 15, fontWeight: "bold"}} variant={"titleLarge"}>SPH+</Text>
            </Pressable>
            <Button
                style={styles.button}
                icon="timer-sand"
                mode={"contained"}
                onPress={() => router.navigate("/schedule")}
            >Stundenplan</Button>
            <Button
                style={styles.button}
                icon="account-arrow-left-outline"
                mode={"contained"}
                onPress={() => router.navigate("/substitution")}
            >Vertretungsplan</Button>
            <Button
                style={styles.button}
                icon="book-education-outline"
                mode={"contained"}
                onPress={() => router.navigate("/myLessons")}
            >Mein Unterricht</Button>
            <Button
                style={styles.button}
                icon="message-text-outline"
                mode={"contained"}
                onPress={() => router.navigate("/messages")}
            >Nachrichten</Button>
            <Button
                style={styles.button}
                icon="logout"
                mode={"contained-tonal"}
                onPress={() => {
                    Cache.debugLog.push("Logout")
                    SecureStore.deleteItemAsync("credentials");
                    router.replace("/login")
                }}
            >Logout</Button>
            {
                clicker >= 10 ?
                    <Button
                        style={{marginTop: 20}}
                        icon="slide"
                        mode={"elevated"}
                        onPress={() => router.navigate("/test")}
                    >Playground (Nicht benutzen)</Button>
                    : null
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        width: "60%",
        margin: 5
    }
});
