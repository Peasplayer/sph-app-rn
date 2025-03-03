import {StyleSheet, Text} from "react-native";
import React, {useEffect} from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {Link, useNavigation} from 'expo-router';
import {Appbar} from "react-native-paper";

export default function Home() {
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
            <Appbar.Header>
                <Appbar.Content title="Startseite" />
            </Appbar.Header>)
        });
    })

    return (
        <SafeAreaView
            style={styles.container}
        >
            <Text>Home</Text>
            <Link href={"/schedule"}>Schedule</Link>
            <Link href={"/substitution"}>Substitution</Link>
            <Link href={"/messages"}>Messages</Link>
            <Link href={"/login"}>login</Link>
            <Link href={"/test"}>test</Link>
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
