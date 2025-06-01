import * as React from 'react';
import {Modal, Platform, Pressable, ScrollView, View} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import Cache from "@/lib/Cache";
import BackgroundTasker from "@/lib/BackgroundTasker";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Mime from 'react-native-mime-types'; // Optional for better MIME detection

export default function Test() {
    const theme = useTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const [backgroundTasker, setBackgroundTasker] = useState<BackgroundTasker>();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <Pressable style={{backgroundColor: "black", opacity: 0.5,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0}}
                               onPress={() => {setModalVisible(false)}}
                    />
                    <View style={{flex: 1, alignItems:"center", justifyContent:"center"}}>
                        <View style={{backgroundColor: "white", opacity: 1, alignSelf: "center", padding: 20, width:"80%", maxHeight: "90%"}}>
                            <Text style={{fontWeight: "bold", fontSize: 24}}>Ausgeblendete Kurse</Text>
                            <Text style={{textDecorationLine: "underline", fontSize: 18}}>(Anklicken zum einblenden)</Text>
                            <Text style={{fontStyle: "italic"}}>Noch nichts ausgeblendet :)</Text>
                        </View>
                    </View>
                </Modal>
                <BackgroundTasker onRef={setBackgroundTasker} dependencies={["https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"]} />
                <Button onPress={() => {
                    Cache.currentSession.Messages._fetchChatsRaw("all").then((r: any) => {
                        const data = r.data;
                        backgroundTasker?.executeCode(`
                            const key = "${Cache.currentSession.sessionKey}";
                            const data = "${data}";
                            return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
                        `, data1 => console.log("task1 s", data1), data1 => console.log("task1 e", data1));
                    });
                }}>
                    <Text>Hello World!</Text>
                </Button>
                <Button onPress={async () => {
                    backgroundTasker?.executeCode(`return CryptoJS;`, data1 => console.log("task1 s", data1), data1 => console.log("task1 e", data1));
                    backgroundTasker?.executeCode(`return "test123";`, data1 => console.log("task2 s", data1), data1 => console.log("task2 e", data1));
                }}>
                    <Text>Test me!</Text>
                </Button>
                <Button onPress={async () => {
                    console.log("Hmmm 0")
                    const res = (await Cache.currentSession.fetchWrapper.fetch("https://start.schulportal.hessen.de/meinunterricht.php?a=downloadFile&id=3607&e=2&f=Demo-1.gif", {Headers: Cache.currentSession.Headers}));
                    console.log(res)
                    console.log("Hmmm 111")
                    const fr = new FileReader();
                    console.log("Hmmm 1")
                    fr.onload = async () => {
                        console.log("Hmmm 2" + fr.result?.toString().split(',')[0])
                        const fileUri = `${FileSystem.cacheDirectory}/Demo-1.gif`;
                        console.log("Hmmm 3" + fileUri)
                        await FileSystem.writeAsStringAsync(fileUri, fr.result?.toString().split(',')[1] as string, { encoding: FileSystem.EncodingType.Base64 });
                        console.log("Hmmm 4")
                        //Linking.openURL(fileUri)
                        //Sharing.shareAsync(fileUri);
                        if (Platform.OS === 'ios') {
                            // iOS: Use sharing sheet
                            await Sharing.shareAsync(fileUri);
                        } else if (Platform.OS === 'android') {
                            // Android: Use IntentLauncher
                            const mimeType = Mime.lookup(fileUri) || 'application/octet-stream';
                            console.log("Hmmm 5", mimeType);
                            try {

                                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                                    data: await FileSystem.getContentUriAsync(fileUri),
                                    flags: 1,
                                    type: mimeType,
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    };
                    fr.readAsDataURL(await res.defaultObject.blob());
                }}>
                    <Text>downloading...</Text>
                </Button>
                <ScrollView style={{flex: 1}}>
                    {
                        Cache.debugLog.map((log: any, i) =>
                            <View key={i} style={{marginVertical: 10, backgroundColor: theme.colors.surfaceVariant}}>
                                <Text selectable={true}>{log}</Text>
                            </View>
                        )
                    }
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};