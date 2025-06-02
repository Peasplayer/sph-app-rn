import {Alert, StyleSheet} from "react-native";
import {ActivityIndicator, Text, useTheme} from "react-native-paper";
import {useEffect, useState} from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import {Session} from "sph-api";
import FetchWrapper from "@/lib/FetchWrapper";
import Crypto from "@/lib/Crypto";
import Cache from "@/lib/Cache";

export default function Index() {
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);

    async function startLogin() : Promise<void> {
        if (Cache.currentSession == undefined) {
            const cred = await SecureStore.getItemAsync("credentials");

            if (cred == null) {
                router.replace("/login");
                return;
            }

            const session = new Session(new Crypto(), new FetchWrapper());
            try {
                const result = await session.login(JSON.parse(cred));
                Cache.debugLog.push("Login on index : " + JSON.stringify(result))
                Cache.currentSession = session;

                router.replace("/home");
            }
            catch (e: any) {
                Alert.alert("Fehler", "Es gab einen Fehler beim automatischen anmelden!\n\n" + e.message + "\n\nErneut versuchen?", [
                    {
                        text: 'Ja',
                        onPress: () => startLogin(),
                    },
                    {
                        text: 'Nein',
                        onPress: () => router.replace("/login"),
                        style: 'cancel',
                    }]);
                return;
            }
        }
        else
            setTimeout(() => router.replace("/home"), 10)
    }
    useEffect(() => {
        if (isLoading)
            startLogin();
        else
            router.replace("/home");
    }, [isLoading]);

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Text variant={"titleLarge"}>Lädt...</Text>
            <ActivityIndicator animating={true} size={"large"} />
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
