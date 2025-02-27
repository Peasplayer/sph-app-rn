import {StyleSheet, Text} from "react-native";
import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {Link} from 'expo-router';

export default function Home() {
    return (
        <SafeAreaView
            style={styles.container}
        >
            <Text>Home</Text>
            <Link href={"/schedule"}>Schedule</Link>
            <Link href={"/substitution"}>Substitution</Link>
            <Link href={"/login"}>login</Link>
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
