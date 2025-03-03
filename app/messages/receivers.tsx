import {SafeAreaView} from "react-native-safe-area-context";
import {router, useNavigation} from "expo-router";
import React, {useEffect} from "react";
import {Appbar, Chip, Searchbar} from "react-native-paper";
import {FlatList, View} from "react-native";
import Cache from "@/lib/Cache";

export default function Receivers() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searched, setSearched] = React.useState(true);
    const [results, setResults] = React.useState([]);

    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
                <Appbar.Header>
                    <Appbar.BackAction onPress={router.back} />
                    <Appbar.Content title="Empfänger" />
                </Appbar.Header>)
        });
    })

    if (searchQuery.length >= 2 && !searched) {
        Cache.currentSession.Messages.searchReceiver(searchQuery).then((r: any) => {
            Cache.debugLog.push("Message # search receiver : " + JSON.stringify(r))
            if (r.success) {
                setResults(r.data.items);
                setSearched(true);
            }
        })
    }

    return (<SafeAreaView>
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
    </SafeAreaView>);
}