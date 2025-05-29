import {Pressable, StyleSheet} from "react-native";
import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {Button, Text, useTheme} from "react-native-paper";

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
                icon="book-account-outline"
                mode={"contained"}
                onPress={() => router.navigate("/substitution")}
            >Vertretungsplan</Button>
            <Button
                style={styles.button}
                icon="message-text-outline"
                mode={"contained"}
                onPress={() => router.navigate("/messages")}
            >Nachrichten</Button>
            <Button
                style={styles.button}
                icon="login"
                mode={"contained"}
                onPress={() => router.navigate("/login")}
            >Login</Button>
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
