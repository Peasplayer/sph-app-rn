import {SafeAreaView} from "react-native-safe-area-context";
import {router, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {Appbar, Chip, Searchbar, useTheme} from "react-native-paper";
import {FlatList, View} from "react-native";
import Cache from "@/lib/Cache";
import {Receiver} from "sph-api/dist/Messages";

export default function Receivers() {
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={router.back} />
                <Appbar.Content title="Empfänger" />
            </Appbar.Header>)
        });
    })
    const theme = useTheme();

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searched, setSearched] = useState<boolean>(true);
    const [results, setResults] = useState<Receiver[]>([]);

    if (searchQuery.length >= 2 && !searched) {
        Cache.currentSession.Messages.searchReceiver(searchQuery).then((r: Receiver[]) => {
            Cache.debugLog.push("Message # search receiver : " + JSON.stringify(r))
            setResults(r);
            setSearched(true);
        })
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background, padding: 5}}>
            <Searchbar
                placeholder="Suchen..."
                onChangeText={text => {
                    setSearchQuery(text);
                    setSearched(false)
                }}
                value={searchQuery}
            />
            <FlatList data={results} renderItem={(item: any) => {
                return (
                    <View style={{alignItems: "center", margin: 3, flexDirection: "row"}}>
                        <Chip icon={item.item.type === "sus" ? "school" :
                            (item.item.type === "lul" ? "human-male-board" : "account")} onPress={() => {
                            //router.replace("/messages/new?receiver=" + JSON.stringify(item.item))
                            router.back()
                            router.setParams({ receiver: JSON.stringify(item.item) })
                        }}>{item.item.text}</Chip>
                    </View>
                )
            }} />
        </SafeAreaView>
    );
}