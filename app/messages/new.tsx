import {SafeAreaView} from "react-native-safe-area-context";
import {router, useLocalSearchParams, useNavigation} from "expo-router";
import React, {useEffect, useState} from "react";
import {Appbar, Button, Chip, Surface, Text, TextInput, useTheme} from "react-native-paper";
import {ScrollView, View} from "react-native";
import Cache from "@/lib/Cache";

export default function New() {
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={router.back} />
                <Appbar.Content title="Neuer Chat" />
            </Appbar.Header>)
        });
    })
    const theme = useTheme();

    const [receivers, setReceivers] = useState<any[]>([]);
    const [lastReceiver, setLastReceiver] = useState<any>(undefined);
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [canSend, setCanSend] = useState(false);
    const params = useLocalSearchParams<{receiver?: string}>();

    if (params.receiver !== undefined) {
        const receiver = JSON.parse(params.receiver);
        if (receivers.find(r => r.id === receiver.id) === undefined && (lastReceiver === undefined || lastReceiver.id !== receiver.id)) {
            receivers.push(receiver);
            setReceivers(receivers);
            setLastReceiver(receiver);
        }
    }

    function sendMessage() {
        if (canSend) {
            Cache.currentSession.Messages.createNewChat(receivers.map(r => r.id), title, content).then((r: any) => {
                Cache.debugLog.push("Message # create chat : " + JSON.stringify(r))
                if (r.success) {
                    // @ts-ignore
                    router.replace("/messages/" + r.data);
                }
            })
        }
    }

    const flag = receivers.length > 0 && title.length > 0 && content.length > 0;
    if (flag !== canSend) {
        setCanSend(flag);
    }

    return (<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
        <ScrollView>
            <Surface style={{margin: 10, padding: 5, borderRadius: 10}}>
                <Text>Empfänger</Text>
                <ScrollView
                    style={{flex: 1}}>
                    <View style={{margin: 3, flexDirection: "row", flexWrap: "wrap"}}>

                        {receivers.map((receiver: any, i: number) => (
                            <Chip
                                key={i}
                                style={{margin: 3}}
                                icon={receiver.type === "sus" ? "school" :
                                    (receiver.type === "lul" ? "human-male-board" : "account")}
                                onPress={() => {
                                    setReceivers(receivers.filter(r => r.id !== receiver.id))
                                }}
                            >{receiver.text}</Chip>
                        ))}
                        <Chip
                            key={"add"}
                            style={{margin: 3}}
                            icon={"plus"}
                            onPress={() => {
                                router.navigate("/messages/receivers");
                            }}
                        >Hinzufügen</Chip>
                    </View>
                </ScrollView>
            </Surface>
            <TextInput
                style={{margin: 10}}
                label={"Titel"}
                mode={"flat"}
                value={title}
                onChangeText={(text) => {
                    setTitle(text);
                }}
            />
            <TextInput
                style={{margin: 10}}
                label={"Inhalt"}
                mode={"flat"}
                multiline={true}
                value={content}
                onChangeText={(text) => {
                    setContent(text);
                }}
            />
            <View style={{ margin: 3, padding: 5, borderRadius: 10}}>
                <Button icon={"send"} mode={"contained"} disabled={!canSend} onPress={sendMessage}>Senden</Button>
            </View>
        </ScrollView>
    </SafeAreaView>);
}