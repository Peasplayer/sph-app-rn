import {Pressable, StyleSheet, View} from "react-native";
import {useState} from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {Badge, Button, Text, useTheme} from "react-native-paper";
import Cache from "@/lib/Cache";
import * as SecureStore from "expo-secure-store";

export default function Home() {
    const theme = useTheme();

    const [clicker, setClicker] = useState<number>(0);
    const [alerts, setAlerts] = useState<{
        "myLessons": {alerts: any, texts: string[]};
        "schedule": {alerts: any, texts: string[]};
        "messages": {alerts: any, texts: string[]};
        "substitution": {alerts: any, texts: string[]};
    }|undefined>();

    if (alerts === undefined) {
        Cache.currentSession.fetchAlerts().then((r: any) => {
           setAlerts(r);
        });
    }

    return (
        <SafeAreaView
            style={[styles.container, {backgroundColor: theme.colors.background}]}
        >
            <Pressable onPress={() => {setClicker(clicker + 1)}}>
                <Text style={{margin: 15, fontWeight: "bold"}} variant={"titleLarge"}>SPH+</Text>
            </Pressable>
            <View style={styles.button}>
                <Button
                    icon="timer-sand"
                    mode={"contained"}
                    onPress={() => router.navigate("/schedule")}
                >Stundenplan</Button>
                {alerts !== undefined && alerts.schedule !== undefined ? <Badge visible={true} style={{position: "absolute", top: -7, left: -7}}>{alerts.schedule.alerts}</Badge> : null}
            </View>
            <View style={styles.button}>
                <Button
                    icon="account-arrow-left-outline"
                    mode={"contained"}
                    onPress={() => router.navigate("/substitution")}
                >Vertretungsplan</Button>
                {alerts !== undefined && alerts.substitution !== undefined ? <Badge visible={true} style={{position: "absolute", top: -7, left: -7}}>{alerts.substitution.alerts}</Badge> : null}
            </View>
            <View style={styles.button}>
                <Button
                    icon="book-education-outline"
                    mode={"contained"}
                    onPress={() => router.navigate("/myLessons")}
                >Mein Unterricht</Button>
                {alerts !== undefined && alerts.myLessons !== undefined ? <Badge visible={true} style={{position: "absolute", top: -7, left: -7}}>{alerts.myLessons.alerts}</Badge> : null}
            </View>
            <View style={styles.button}>
                <Button
                    icon="message-text-outline"
                    mode={"contained"}
                    onPress={() => router.navigate("/messages")}
                >Nachrichten</Button>
                {alerts !== undefined && alerts.messages !== undefined ? <Badge visible={true} style={{position: "absolute", top: -7, left: -7}}>{alerts.messages.alerts}</Badge> : null}
            </View>
            <Button
                style={[styles.button, {marginTop: 15}]}
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
