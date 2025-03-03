import {StyleSheet, View} from "react-native";
import {ActivityIndicator, Text} from "react-native-paper";
import React, {useEffect} from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// @ts-ignore
import {Session} from "sph-api";
// @ts-ignore
import FetchWrapper from "@/lib/FetchWrapper";
import Crypto from "@/lib/Crypto";
import Cache from "@/lib/Cache";

export default function Index() {
    const [isLoading, setLoading] = React.useState(true);

    async function startLogin() : Promise<void> {
        if (Cache.currentSession == undefined) {
            const cred = await SecureStore.getItemAsync("credentials");

            if (cred == null) {
                router.replace("/login");
                return;
            }

            const session = new Session(new Crypto(), new FetchWrapper());
            const result = await session.login(JSON.parse(cred));
            Cache.debugLog.push("Login on index : " + JSON.stringify(result))
            if (result.success) {
                Cache.currentSession = session;

                router.replace("/home");
                return;
            }
        }

        router.replace("/login");
    }
    useEffect(() => {
        if (isLoading)
            startLogin();
        else
            router.replace("/home");
    });

    return (
        <SafeAreaView style={styles.container}>
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
