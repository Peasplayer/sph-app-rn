import {View, StyleSheet, ScrollView, TextInput, Alert} from 'react-native';
import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {Appbar, Chip, IconButton, Surface, Text, useTheme} from 'react-native-paper';
import {useEffect, useRef, useState} from "react";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import Utils from "@/lib/Utils";
import * as React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {Row} from "react-native-reanimated-table";

export default function DetailsScreen() {
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
                <Appbar.Header>
                    <Appbar.BackAction onPress={router.back} />
                    <Appbar.Content title={data?.initialMessage?.subject} />
                    <Appbar.Action icon={"information"} onPress={() => bottomSheetModalRef.current?.present()} />
                </Appbar.Header>)
        });
    })
    const theme = useTheme();

    const { uuid, chat } = useLocalSearchParams();
    const [data, setData] = useState<any>(undefined);
    const [chatData, setChatData] = useState<any[]>([]);
    const [text, setText] = useState<string>("");
    const scrollViewRef = useRef<ScrollView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    scrollViewRef.current?.scrollToEnd();

    function renderMessage(message: any) {
        const senderColor = Utils.stringToColour(message.sender.name);
        const date = new Date(message.date)
        setTimeout(() => scrollViewRef.current?.scrollToEnd(), 50);
        return <View key={message.id}>
            <View style={[styles.message, message.ownMessage ? (theme.dark ? styles.ownMessageDark : styles.ownMessage) : (theme.dark ? styles.otherMessageDark : styles.otherMessage)]}>
                {message.ownMessage ? <></> :
                    <Text
                        variant={"bodySmall"}
                        style={{color: theme.dark ?
                                (Utils.wc_hex_is_dark(senderColor) ? Utils.invertHexColor(senderColor) : senderColor)
                                : ((Utils.wc_hex_is_dark(senderColor) ? senderColor : Utils.invertHexColor(senderColor)))}}
                    >{message.sender.name}</Text>
                }
                <Text variant={"bodyMedium"} selectable={true}>
                    {(message.content.trim().match(/[\s\S]{1,100000}/) ?? []).map((s: string, i: number) => <Text key={i}>{s}</Text>)}</Text>
                <Text variant={"bodySmall"} style={{alignSelf: "flex-end", color: "darkgrey"}}>{(date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + " Uhr")}</Text>
            </View>
        </View>
    }

    function sendReply() {
        if (text.length === 0)
            return;

        Cache.currentSession.Messages.replyToChat(uuid, text).then((r: any) => {
            Cache.debugLog.push("Message # reply : " + JSON.stringify(r))
            if (!r.success) {
               Alert.alert("Fehler", "Etwas lief schief beim antworten!");
               return;
            }

            setText("");

            const _chat = chatData;
            if (new Date(_chat.findLast(i => i.type === "message").data.date).toLocaleDateString("de", {timeZone: "Europe/Berlin"})
                !== new Date(Date.now()).toLocaleDateString("de", {timeZone: "Europe/Berlin"}))
                _chat.push({type: "date", data: "Heute"});
            _chat.push({type: "message", data: {sender: {name: ""}, date: Date.now(), id: r.data, ownMessage: true, content: text}});
            setChatData(_chat);

            setTimeout(loadChat, 1000);
        });
    }

    function loadChat() {
        Cache.currentSession.Messages.fetchChatMessages(uuid).then((r: any) => {
            console.log("fetched chat");
            Cache.debugLog.push("Messages# fetch chat messages : " + JSON.stringify(r))
            if (r.success) {
                try {
                    setData(r.data);

                    const _chat: any[] = [];
                    _chat.push({type: "message", data: r.data.initialMessage});
                    r.data.initialMessage.replies.forEach((reply: any) => _chat.push({type: "message", data: reply}));

                    const todaysDateString = new Date(Date.now()).toLocaleDateString("de", {timeZone: "Europe/Berlin"});
                    const yesterdaysDateString = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("de", {timeZone: "Europe/Berlin"});
                    _chat.filter(m => m.type === "message").forEach((message: any) => {
                        const index = _chat.indexOf(message);
                        if (index === 0) {
                            const dateString = (new Date(message.data.date)).toLocaleDateString("de", {timeZone: "Europe/Berlin"});
                            if (dateString === todaysDateString)
                                _chat.splice(0, 0, {type: "date", data: "Heute"})
                            else if (dateString === yesterdaysDateString)
                                _chat.splice(0, 0, {type: "date", data: "Gestern"})
                            else
                                _chat.splice(0, 0, {type: "date", data: dateString})
                        }
                        else {
                            const dateString = (new Date(message.data.date)).toLocaleDateString("de", {timeZone: "Europe/Berlin"});
                            const previousDateString = (new Date(_chat[index - 1].data.date)).toLocaleDateString("de", {timeZone: "Europe/Berlin"});
                            if (dateString !== previousDateString) {
                                if (dateString === todaysDateString)
                                    _chat.splice(index, 0, {type: "date", data: "Heute"})
                                else if (dateString === yesterdaysDateString)
                                    _chat.splice(index, 0, {type: "date", data: "Gestern"})
                                else
                                    _chat.splice(index, 0, {type: "date", data: dateString})
                            }
                        }
                    })

                    setChatData(_chat);
                }
                catch (error) {
                    console.log("err in chat load", error);
                }
            }
        });
    }

    if (data === undefined) {
        loadChat();
    }

    const noAnswerAllowed = data?.initialMessage?.options?.noAnswerAllowed;
    const noAnswerToDeleted = !data?.initialMessage?.options?.respondToDeleted && data?.initialMessage?.markedAsDeleted;

    return (
        <GestureHandlerRootView>
            <BottomSheetModalProvider>
                <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
                    <View style={{flex: 1}}>
                        <ScrollView bounces={false} ref={scrollViewRef}>
                            {data !== undefined ? (chatData.map(chatEntry => {
                                if (chatEntry.type === "message")
                                    return renderMessage(chatEntry.data);
                                else if (chatEntry.type === "date") {
                                    return <Chip key={chatEntry.data} style={{width: "auto", alignSelf: "center", marginVertical: 3}}>{chatEntry.data}</Chip>
                                }
                            })) : (<></>)}
                        </ScrollView>
                    </View>
                    <View style={{bottom: 0, alignSelf:"center", margin: 5, height: "auto", flexDirection: "row"}}>
                        {(!noAnswerAllowed && !noAnswerToDeleted || data?.initialMessage?.ownMessage) ? (<>
                            <View style={{
                                flex: 9,
                                padding: 10,
                                paddingHorizontal: 10,
                                backgroundColor: theme.colors.onBackground,
                                borderRadius: 20,
                                justifyContent: "center"
                            }}>
                                <TextInput
                                    multiline={true}
                                    placeholder={"Schreibe eine Nachricht..."}
                                    value={text}
                                    onChangeText={setText}
                                    style={{fontSize: 16}}
                                    onPress={() => scrollViewRef.current?.scrollToEnd()}
                                />
                            </View><View style={{justifyContent: "center"}}>
                            <IconButton
                                icon="send"
                                mode="contained-tonal"
                                size={20}
                                onPress={sendReply}/>
                        </View>
                        </>) : (<>
                            <View style={{flexDirection: "row", justifyContent: "center", alignContent: "center"}}>
                                <View style={{justifyContent: "center"}}>
                                    <Text style={{justifyContent: "center"}}>Eine Antwort ist nicht möglich!</Text>
                                </View>
                                <View>
                                    <IconButton icon={"help-circle"} onPress={() => Alert.alert("Keine Antwort möglich", "Eine Antwort auf diese Nachricht ist nicht möglich weil, "
                                        + (noAnswerAllowed ? "Antworten auf diese Nachricht vom Absender deaktiviert wurden."
                                            : (noAnswerToDeleted ? "diese Nachricht vom Absender zur Löschung vorgemerkt wurde und dieser keine neuen Antworten erlaubt."
                                                : "etwas schief gelaufen ist.")))}></IconButton>
                                </View>
                            </View>
                        </>)}
                    </View>
                </SafeAreaView>
                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    backgroundStyle={{backgroundColor: theme.colors.background}}
                    backdropComponent={props => (
                        <BottomSheetBackdrop
                            {...props}
                            opacity={0.5}
                            enableTouchThrough={false}
                            appearsOnIndex={0}
                            disappearsOnIndex={-1}
                            style={[{ backgroundColor: 'black' }, StyleSheet.absoluteFillObject]}
                        />)}
                >
                    <BottomSheetScrollView style={{flexDirection: "column", alignContent: "center"}}>
                        <Text style={{fontWeight: "bold", fontSize: 24, alignSelf: "center"}}>{data?.initialMessage?.subject}</Text>
                        <Row flexArr={[3, 3]} data={[<Text style={{alignSelf: "flex-end"}}>von </Text>, <Text style={{fontWeight: "bold"}}>{data?.initialMessage?.sender?.name}</Text>]} />
                        <Row flexArr={[3, 3]} data={[<Text style={{alignSelf: "flex-end"}}>Antworten erlaubt: </Text>, <Text style={{fontWeight: "bold"}}>{!data?.options?.noAnswerAllowed ? "Ja" : "Nein"}</Text>]} />
                        {data?.options?.privateAnswerOnly ? <Row flexArr={[3, 3]} data={[<Text style={{alignSelf: "flex-end"}}>Antwort nur an </Text>, <Text style={{fontWeight: "bold"}}>Absender</Text>]} /> : (<></>)}
                        {data?.options?.groupOnly ? <Row flexArr={[3, 3]} data={[<Text style={{alignSelf: "flex-end"}}>Antwort nur an </Text>, <Text style={{fontWeight: "bold"}}>Alle</Text>]} /> : (<></>)}
                        <Surface style={{margin: 10, padding: 5, borderRadius: 10}}>
                            <Text>Empfänger (
                                {data?.initialMessage?.users?.parents > 0 ? " " + data?.initialMessage?.users?.parents + " Eltern " : ""}
                                {data?.initialMessage?.users?.students > 0 ? " " + data?.initialMessage?.users?.students + " Schüler " : ""}
                                {data?.initialMessage?.users?.teachers > 0 ? " " + data?.initialMessage?.users?.teachers + " Lehrer " : ""})</Text>
                            <View style={{margin: 3, flexDirection: "row", flexWrap: "wrap"}}>
                                {data?.initialMessage?.receivers?.map((receiver: any, i: number) => (
                                    <Chip
                                        key={i}
                                        style={{margin: 3}}
                                        icon={receiver.role === "student" ? "school" :
                                            (receiver.role === "teacher" ? "human-male-board" : "account")}
                                    >{receiver.name}</Chip>
                                ))}
                                {data?.initialMessage?.additionalReceivers?.map((receiver: any, i: number) => (
                                    <Chip
                                        key={i}
                                        style={{margin: 3}}
                                        icon={receiver.role === "student" ? "school" :
                                            // @ts-ignore
                                            (receiver.role === "teacher" ? "human-male-board" : "account")}
                                    >{receiver.name}</Chip>
                                ))}
                            </View>
                        </Surface>
                    </BottomSheetScrollView>
                </BottomSheetModal>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    message: {
        margin: 3,
        marginHorizontal: 10,
        padding: 5,
        paddingHorizontal: 10,
        maxWidth: "80%",
        borderRadius: 5,
    },
    otherMessage: {
        backgroundColor: "white",
    },
    otherMessageDark: {
        backgroundColor: "#363636"
    },
    ownMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#D0FECF",
    },
    ownMessageDark: {
        alignSelf: "flex-end",
        backgroundColor: "#005C4B",
    }
});
