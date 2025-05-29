import {Alert, StyleSheet, View} from "react-native";
import {Button, Chip, Surface, TextInput, Title, useTheme} from 'react-native-paper';
import {Session} from "sph-api";
// @ts-ignore
import FetchWrapper from "@/lib/FetchWrapper";
import Crypto from "@/lib/Crypto";
import {useRef, useState} from "react";
import {SafeAreaView} from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import {router, useLocalSearchParams} from 'expo-router';
import Cache from "@/lib/Cache";
import SPHError, {ErrorCode} from "sph-api/dist/lib/SPHError";

export default function Login() {
    const { school } = useLocalSearchParams();
    const theme = useTheme();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // @ts-ignore
    const passwordInput = useRef<TextInput>();

    if (!Cache.currentSession) {
        Cache.currentSession = new Session(new Crypto(), new FetchWrapper());
    }

    function handleLogin() {
        if (!school) {
            Alert.alert("Fehler", "Gebe bitte eine Schul-ID an");
            return;
        }
        if (!username || username.trim() == "") {
            Alert.alert("Fehler", "Gebe bitte einen Benutzernamen an");
            return;
        }
        if (!password || password.trim() == "") {
            Alert.alert("Fehler", "Gebe bitte ein Passwort an");
            return;
        }

        try {
            Cache.currentSession.login({schoolId: JSON.parse(school as string).id, username, password}).then(async () => {
                Cache.debugLog.push("Login")

                await SecureStore.setItemAsync("credentials", JSON.stringify({schoolId: JSON.parse(school as string).id, username, password}));

                router.navigate("/home");
            });
        }
        catch (e) {
            if (e instanceof SPHError) {
                if (e.code === ErrorCode.CredentialsNotComplete) {
                    Alert.alert("Fehler", "Unvollständige Zugangsdaten!");
                }
                else if (e.code === ErrorCode.SPHRejected) {
                    Alert.alert("Fehler", "Das Schulportal hat folgenden Fehler zurückgegeben:\n\n" + e.message);
                }
                else if (e.code === ErrorCode.FailedHandshake) {
                    Alert.alert("Fehler", "Ein Fehler bei der Verschlüsselung ist aufgetreten!");
                }
            }
            else if (e instanceof Error) {
                Alert.alert("Fehler", "Ein Fehler ist aufgetreten!\n\n" + e.message);
            }
        }
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.surface
            }}
        >
            <Surface style={{borderRadius: 15, alignItems: "center", padding: 5, paddingVertical: 15}}>
                <Title style={styles.title}>Login</Title>
                <View style={styles.inputContainer}>
                    {school ?
                        <Chip
                            icon={"school"}
                            style={{flex: 1, justifyContent: "center"}}
                        >{JSON.parse(school as string).name}</Chip> :
                        <Button icon={"school"} mode={"contained"} onPress={() => router.navigate("/schoolList")}>Schule auswählen...</Button>}
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        disabled={!school}
                        style={styles.input}
                        mode={"outlined"}
                        left={<TextInput.Icon icon="account" />}
                        label="Loginname"
                        placeholder="Max.Muster oder MM"
                        value={username}
                        onChangeText={text => setUsername(text)}
                        returnKeyType="next"
                        onSubmitEditing={() => { passwordInput.current?.focus(); }}
                        submitBehavior={"submit"}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        disabled={!school}
                        style={styles.input}
                        mode={"outlined"}
                        left={<TextInput.Icon icon="key" />}
                        label="Passwort"
                        placeholder="S1cH3re? 9aSsw0r7"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={text => setPassword(text)}
                        ref={passwordInput}
                        onSubmitEditing={handleLogin}
                    />
                </View>
                <Button style={styles.button} icon="login" mode="contained" onPress={handleLogin}>
                    Login
                </Button>
            </Surface>
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
        width: "80%",
        margin: 3,
        marginBottom: 8,
        borderRadius: 10,
        alignItems: "center",
    },
    button: {
        width: "80%",
        marginTop: 25,
        fontSize: 24
    }
});
