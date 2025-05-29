import {Alert, FlatList, StyleSheet, View} from "react-native";
import {useCallback, useEffect, useState} from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    Appbar,
    Avatar,
    Badge,
    Divider,
    FAB,
    Icon,
    Searchbar,
    Text,
    TouchableRipple,
    useTheme
} from "react-native-paper";
import Cache from "@/lib/Cache";
import Utils from "@/lib/Utils";
import {router, useNavigation} from "expo-router";
import {Message} from "sph-api/dist/Messages"

export default function Index() {
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={router.back} />
                <Appbar.Content title="Nachrichten" />
                {
                    loading ? <></> : (<>
                        <Appbar.Action icon={hidden ? "eye-off" : "eye"} onPress={() => {
                            setHidden(!hidden);
                            setShownChats(!hidden ? hiddenChats : visibleChats);
                        }} />
                        <Appbar.Action icon={"magnify"} mode={showSearchBar ? 'contained' : undefined} onPress={() => {
                            setShowSearchBar(!showSearchBar);
                            if (showSearchBar)
                                setSearchQuery("");
                        }} />
                    </>)
                }
            </Appbar.Header>)
        });
    })
    const theme = useTheme();

    const [hiddenChats, setHiddenChats] = useState<any[]>();
    const [visibleChats, setVisibleChats] = useState<any[]>();
    const [shownChats, setShownChats] = useState<any[]>();
    const [hidden, setHidden] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [loading, setLoading] = useState(true);
    const cryptoTasker = Cache.CryptoTasker;
    const onRefresh = useCallback(() => {
        setRefreshing(true);

        if (hidden) {
            setTimeout(() =>
                Cache.currentSession.Messages.fetchChats(false).then((r: Message[]) => {
                    Cache.debugLog.push("Message # fetch chats : " + JSON.stringify(r))
                    setHiddenChats(r);
                    if (hidden) {
                        console.log("refreshing", "hidden", "setShownChats");
                        setShownChats(r);
                    }
                    setRefreshing(false);
                }), 1);
        }
        else {
            setTimeout(() => Cache.currentSession.Messages.fetchChats(true).then((r: Message[]) => {
                Cache.debugLog.push("Message # fetch chats : " + JSON.stringify(r))
                setVisibleChats(r);
                if (!hidden) {
                    setShownChats(r);
                }
                setRefreshing(false);
            }), 1)
        }
    }, [hidden]);

    if (hiddenChats === undefined && visibleChats === undefined && cryptoTasker !== undefined) {
        Cache.currentSession.Messages.fetchChats("all").then((r: any) => {
            const hiddenData = r.data.filter((c: any) => c.deleted === true);
            setHiddenChats(hiddenData);
            const visibleData = r.data.filter((c: any) => c.deleted === false);
            setVisibleChats(visibleData);

            setShownChats(hidden ? hiddenData : visibleData);

            setLoading(false);
        })
    }

    return (
        <SafeAreaView
            style={{flex: 1, backgroundColor: theme.colors.background}}
        >
            {
                loading ?
                    <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
                        <Text variant={"titleLarge"}>Lädt...</Text>
                        <Text variant={"titleSmall"}>(Das kann ein bisschen dauern)</Text>
                        <ActivityIndicator animating={true} size={"large"} />
                    </View>
                    :
                    <>
                        <FAB
                            icon="plus"
                            style={styles.fab}
                            onPress={() => router.navigate("/messages/new")}
                        />
                        {
                            showSearchBar ?
                                <View style={{padding: 5}}>
                                    <Searchbar
                                        placeholder="Search"
                                        onChangeText={setSearchQuery}
                                        value={searchQuery}
                                    />
                                </View>
                                : <></>
                        }
                        <FlatList
                            style={{flex: 1}}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            data={shownChats?.filter((c: any) => c.subject.includes(searchQuery))}
                            renderItem={(item) => {
                                const chat = item.item;

                                const initialsColor = Utils.stringToColour(chat.sender.name);
                                const date = new Date(chat.date);
                                return (
                                    <View key={chat.id}>
                                        <TouchableRipple
                                            // @ts-ignore
                                            onPress={() => router.navigate("/messages/" + chat.uuid + "?chat=" + JSON.stringify(chat))}
                                            onLongPress={() => {
                                                Alert.alert(hidden ? "Einblenden" : "Ausblenden", "Möchten Sie die Nachricht wirklich " + (hidden ? "wieder einblenden" : "ausblenden") + "?", [
                                                    {text: "Ja", onPress: () => {
                                                            const promise = hidden ? Cache.currentSession.Messages.showMessage(chat.uuid)
                                                                : Cache.currentSession.Messages.hideMessage(chat.uuid)
                                                            promise.then((r: any) => {
                                                                if (r.success) {
                                                                    if (hidden) {
                                                                        const newArray = hiddenChats?.filter((c: any) => c.uuid !== chat.uuid);
                                                                        setHiddenChats(newArray);
                                                                        setShownChats(newArray);

                                                                        visibleChats?.push(chat);
                                                                        visibleChats?.sort((c1: any, c2: any) => c2.date - c1.date);
                                                                        setVisibleChats(visibleChats);
                                                                    }
                                                                    else {
                                                                        const newArray = visibleChats?.filter((c: any) => c.uuid !== chat.uuid);
                                                                        setVisibleChats(newArray);
                                                                        setShownChats(newArray);

                                                                        hiddenChats?.push(chat);
                                                                        hiddenChats?.sort((c1: any, c2: any) => c2.date - c1.date);
                                                                        setHiddenChats(hiddenChats);
                                                                    }
                                                                }
                                                            })
                                                        }},
                                                    {text: "Nein"}
                                                ], {cancelable: true});
                                            }}
                                            rippleColor="rgba(0, 0, 0, .32)"
                                        >
                                            <View style={{flexDirection: "row", flex: 1, alignItems: "flex-start"}}>
                                                <View style={{padding: 10}}>
                                                    <Avatar.Text
                                                        label={chat.initials ? chat.initials.toUpperCase().substring(0, 3) : ""}
                                                        size={40}
                                                        labelStyle={{fontSize: 18}}
                                                        color={Utils.wc_hex_is_dark(initialsColor) ? "white" : "black"}
                                                        style={{backgroundColor: initialsColor}}
                                                    />
                                                </View>
                                                <View style={{flexDirection: "column", flex: 1, padding: 3}}>
                                                    <View style={{flex: 1, flexDirection: "row"}}>
                                                        <View style={{flexDirection: "row", flex: 1}}>
                                                            <Icon
                                                                size={16}
                                                                source={chat.sender.role === "student" ? "school" :
                                                                    (chat.sender.role === "teacher" ? "human-male-board" :
                                                                        (chat.sender.role === "parent" ? "account-child-circle" : "account"))}
                                                            ></Icon>
                                                            <Text style={{fontWeight: chat.unread > 0 ? "bold": "normal", marginLeft: 2}}
                                                                  variant={"bodySmall"}>{chat.sender.name}</Text>
                                                        </View>
                                                        <View style={{width: "auto"}}>
                                                            <Text variant={"bodySmall"}
                                                                  style={{fontWeight: chat.unread > 0 ? "bold": "normal"}}>
                                                                {date.toLocaleDateString("de").split(".").map(s => s.padStart(2, "0")).join(".")}, {date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")} Uhr
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={{flex: 2, flexDirection: "row"}}>
                                                        {chat.unread > 0 ? (
                                                            <Badge style={{alignSelf:"flex-start", marginRight: 6}}>{chat.unread}</Badge>
                                                        ) : (<></>)}
                                                        <View style={{flexDirection: "row", flex: 1}}>
                                                            <Text variant={"titleMedium"} numberOfLines={1}
                                                                  style={{fontWeight: chat.unread > 0 ? "bold": "normal"}}>{chat.subject}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableRipple>
                                        <Divider/>
                                    </View>
                                )
                            }}
                        />
                    </>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        zIndex: 1,
        opacity: 1
    }
});
