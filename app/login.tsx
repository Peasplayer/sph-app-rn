import {Alert, StyleSheet, Text, View} from "react-native";
import {Button, TextInput} from 'react-native-paper';
// @ts-ignore
import {Session} from "sph-api";
// @ts-ignore
import FetchWrapper from "@/lib/FetchWrapper";
import Crypto from "@/lib/Crypto";
import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import Cache from "@/lib/Cache";

export default function Login() {
    const [schoolId, setSchoolId] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    function handleLogin() {
        if (!schoolId || schoolId.trim() == "") {
            Alert.alert("Please input a school id!");
            return;
        }
        if (!username || username.trim() == "") {
            Alert.alert("Please input a username!");
            return;
        }
        if (!password || password.trim() == "") {
            Alert.alert("Please input a password!");
            return;
        }

        var session = new Session(new Crypto(), new FetchWrapper());
        session.login({schoolId, username, password}).then(async (result: any) => {
            Cache.debugLog.push("Login : " + JSON.stringify(result))

            if (result.success) {
                Cache.currentSession = session;
                SecureStore.setItemAsync("credentials", JSON.stringify({schoolId, username, password}));

                router.navigate("/home");
            }
            else {
                if (result.code === 1) {
                    Alert.alert("Fehler", "Unvollständige Zugangsdaten!");
                }
                else if (result.code === 2) {
                    Alert.alert("Fehler", "Das Schulportal hat folgenden Fehler zurückgegeben:\n\n" + result.data);
                }
                else if (result.code === 3) {
                    Alert.alert("Fehler", "Ein Fehler bei der Verschlüsselung ist aufgetreten!");
                }
                else {
                    Alert.alert("Fehler", "Ein Fehler ist aufgetreten!\nCode: " + result.code + "\n\n" + result.data);
                }
            }
        });
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text style={styles.title}>Login</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    mode={"flat"}
                    left={<TextInput.Icon icon="school" />}
                    label="School-ID"
                    placeholder="1234"
                    inputMode="numeric"
                    value={schoolId}
                    onChangeText={text => setSchoolId(text)}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    mode={"flat"}
                    left={<TextInput.Icon icon="account" />}
                    label="Loginname"
                    placeholder="Max.Muster oder MM"
                    value={username}
                    onChangeText={text => setUsername(text)}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    mode={"flat"}
                    left={<TextInput.Icon icon="key" />}
                    label="Passwort"
                    placeholder="S1cH3re? 9aSsw0r7"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={text => setPassword(text)}
                />
            </View>
            <Button style={styles.button} icon="login" mode="contained" onPress={handleLogin}>
                Login
            </Button>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: "row",
        backgroundColor: "lightgray",
        width: "80%",
        margin: 3,
        marginBottom: 8,
        padding: 5,
        borderRadius: 10,
        alignItems: "center",
    },
    button: {
        width: "80%",
        marginTop: 25,
        fontSize: 24
    }
});
