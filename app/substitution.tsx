import {RefreshControl, ScrollView, StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Appbar, Card, Chip, Icon, Surface, Text, Title} from "react-native-paper";
import React, {useEffect} from "react";
import Cache from "@/lib/Cache";
import {router, useNavigation} from "expo-router";
import {Row} from "react-native-reanimated-table";

export default function Substitution() {
    const [subs, setSubs] = React.useState<any[]>();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadSubs(() => setRefreshing(false));
    }, []);

    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
            <Appbar.Header>
                <Appbar.BackAction onPress={router.back} />
                <Appbar.Content title="Vertretungsplan" />
            </Appbar.Header>)
        });
    })

    function loadSubs(callback?: () => void) {
        Cache.currentSession.SubstitutionPlan.fetchSubstitutionPlan().then((r: any) => {
            if (r.success) {
                console.log(r.data)
                setSubs(r.data);
            }

            if (callback !== undefined) {
                callback();
            }
        });
    }

    if (subs === undefined) {
        loadSubs();
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {
                    subs ? subs.map((sub, i) => {
                        const updateDate = new Date(sub.details.updateTimeStamp);

                        return <Surface key={i} style={{margin: 3, padding: 3, borderRadius: 10}}>
                            <View style={{flexDirection: "row", alignContent: "flex-start", flexWrap: "wrap", marginBottom: 5}}>
                                <Title>{sub.details.dayName}</Title>
                                {sub.details.relativeDay ? <Chip key={0} style={{marginLeft: 5, marginBottom: 5}}>{sub.details.relativeDay}</Chip> : <></>}
                                {sub.details.date ? <Chip key={1} icon={"calendar"} style={{marginLeft: 5, marginBottom: 5}}>{sub.details.date}</Chip> : <></>}
                                {sub.details.updateTimeStamp ? <Chip key={2} icon={"update"} style={{marginLeft: 5, marginBottom: 5}}>
                                    {updateDate.toLocaleDateString("de", {timeZone: "Europe/Berlin"}).split(".").map(s => s.padStart(2, "0")).join(".")
                                        + " " + updateDate.getHours() + ":" + updateDate.getMinutes() + " Uhr"}</Chip> : <></>}
                            </View>
                            {(() => {
                                const entryCards = sub.content.entries.map((entry: any, i: number) => {
                                    return (
                                        <Card key={i} style={{margin: 3}} mode={"contained"}>
                                            <Card.Content>
                                                {entry.map((field: any, i: number) =>
                                                    field ? (
                                                        <View key={i} style={{}}>
                                                            <Row data={[
                                                                <View style={{flexDirection: "row", alignItems: "center"}}>
                                                                    <View style={{marginRight: 5}}>
                                                                        <Icon size={15} source={(() => {
                                                                            const key = sub.content.fields[entry.indexOf(field)].key;
                                                                            console.log("key", key)
                                                                            if (key === "Lehrer" || key === "Vertreter")
                                                                                return "human-male-board";
                                                                            if (key === "Stunde")
                                                                                return "timer-sand";
                                                                            if (key.includes("Klasse"))
                                                                                return "account-group";
                                                                            if (key.includes("Fach"))
                                                                                return "book-education-outline";
                                                                            if (key.includes("Raum"))
                                                                                return "map-marker-outline";
                                                                            if (key.includes("Hinweis"))
                                                                                return "note-outline";

                                                                            return "help";
                                                                        })()}/>
                                                                    </View>
                                                                    <Text variant={"bodyMedium"}>{sub.content.fields[entry.indexOf(field)].name + ": "}</Text>
                                                                </View>,
                                                                <Text variant={"bodyMedium"} style={{fontWeight: "bold"}}>{field}</Text>]} flexArr={[1, 2]}></Row>
                                                        </View>
                                                    ) : <></>
                                                )}
                                            </Card.Content>
                                        </Card>
                                    )
                                })

                                if (entryCards.length === 0) {
                                    return (<Text variant={"bodyMedium"} style={{fontStyle: "italic"}}>Keine Einträge!</Text>)
                                }

                                return entryCards;
                            })()}
                        </Surface>;
                    }) : <></>
                }
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5
    }
});