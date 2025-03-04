import * as React from 'react';
import {Modal, Pressable, ScrollView, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import Cache from "@/lib/Cache";
import BackgroundTasker from "@/lib/BackgroundTasker";

export default function Test() {
    const [modalVisible, setModalVisible] = useState(false);
    const [backgroundTasker, setBackgroundTasker] = useState<BackgroundTasker>();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex: 1}}>
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
                        `, (err, data) => console.log("task1", err, data));
                    });
                }}>
                    <Text>Hello World!</Text>
                </Button>
                <Button onPress={async () => {
                    backgroundTasker?.executeCode(`return CryptoJS;`, (err, data) => console.log("task1", err, data));
                    backgroundTasker?.executeCode(`return "test123";`, (err, data) => console.log("task2", err, data));
                }}>
                    <Text>Test me!</Text>
                </Button>
                <ScrollView style={{flex: 1}}>
                    {
                        Cache.debugLog.map((log: any, i) =>
                            <View key={i} style={{marginVertical: 10, backgroundColor: "grey"}}>
                                <Text selectable={true}>{log}</Text>
                            </View>
                        )
                    }
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};