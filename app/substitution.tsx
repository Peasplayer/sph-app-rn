import {RefreshControl, ScrollView, View} from "react-native";
import {Appbar, Card, Chip, Icon, Surface, Text, useTheme} from "react-native-paper";
import React, {useEffect} from "react";
import Cache from "@/lib/Cache";
import {router, useNavigation} from "expo-router";
import {Row} from "react-native-reanimated-table";
import {Tabs, TabScreen, TabsProvider} from "react-native-paper-tabs";
import {SafeAreaView} from "react-native-safe-area-context";
import {SubstitutionPlanDay} from "sph-api/dist/SubstitutionPlan";

export default function Substitution() {
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={router.back} />
                <Appbar.Content title="Vertretungsplan" />
            </Appbar.Header>)
        });
    })
    const theme = useTheme();

    const [subs, setSubs] = React.useState<any[]>();
    const [refreshing, setRefreshing] = React.useState(false);
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadSubs(() => setRefreshing(false));
    }, []);

    function loadSubs(callback?: () => void) {
        Cache.currentSession.SubstitutionPlan.fetchSubstitutionPlan().then((r: SubstitutionPlanDay[]|undefined) => {
            if (r !== undefined) {
                console.log(r)
                setSubs(r);
            }

            if (callback !== undefined) {
                callback();
            }
        });
    }

    if (subs !== undefined && subs.length > 0) {
        return (
            <TabsProvider>
                <Tabs mode="scrollable" showLeadingSpace={false} tabHeaderStyle={{paddingHorizontal: 1, backgroundColor: theme.colors.background}}>
                    {
                        subs.map((sub, i) => {
                            const updateDate = new Date(sub.details.updateTimeStamp);

                            return (
                                <TabScreen
                                    key={i}
                                    icon={sub.content.entries.length <= 9 ? "numeric-" + sub.content.entries.length + "-circle" : "numeric-9-plus-circle"}
                                    label={`${sub.details.dayName}${sub.details.relativeDay ? `\n[${sub.details.relativeDay}]` : "\n⠀"}`.toUpperCase()}
                                >
                                    <View style={{backgroundColor: theme.colors.background, flex: 1}}>
                                        <ScrollView style={{margin: 3, padding: 3, borderRadius: 10}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                                            <View style={{flexDirection: "row", alignContent: "flex-start", flexWrap: "wrap", marginBottom: 5}}>
                                                {sub.details.date ? <Chip key={1} icon={"calendar"} style={{marginLeft: 5, marginBottom: 5}}>{sub.details.date}</Chip> : <></>}
                                                {sub.details.updateTimeStamp ? <Chip key={2} icon={"update"} style={{marginLeft: 5, marginBottom: 5}}>
                                                    {updateDate.toLocaleDateString("de", {timeZone: "Europe/Berlin"}).split(".").map(s => s.padStart(2, "0")).join(".")
                                                        + " " + updateDate.getHours().toString().padStart(2, "0") + ":" + updateDate.getMinutes().toString().padStart(2, "0") + " Uhr"}</Chip> : <></>}
                                            </View>
                                            {sub.content.entries.length > 0
                                                ? sub.content.entries.map((entry: any, i: number) => {
                                                    return (
                                                        <Card key={i} style={{margin: 3}} mode={"contained"}>
                                                            <Card.Content>
                                                                {entry.map((field: any, j: number) => {
                                                                    if (field === undefined)
                                                                        return null;

                                                                    return (
                                                                        <View key={j}>
                                                                            <Row data={[
                                                                                <View style={{flexDirection: "row", alignItems: "center"}}>
                                                                                    <View style={{marginRight: 5}}>
                                                                                        <Icon size={15} source={(() => {
                                                                                            const key = sub.content.fields[j].key;
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
                                                                                            if (key.includes("Art"))
                                                                                                return "tag-outline";

                                                                                            return "help";
                                                                                        })()}/>
                                                                                    </View>
                                                                                    <Text variant={"bodyMedium"}>{sub.content.fields[j].name + ": "}</Text>
                                                                                </View>,
                                                                                <Text variant={"bodyMedium"} style={{fontWeight: "bold"}}>{field ?? ""}</Text>]} flexArr={[1, 2]}>
                                                                            </Row>
                                                                        </View>
                                                                    );
                                                                })}
                                                            </Card.Content>
                                                        </Card>
                                                    )
                                                })
                                                : (<Surface style={{margin: 5, padding: 5, borderRadius: 15, alignItems: "center"}}>
                                                    <Text variant={"bodyMedium"} style={{fontStyle: "italic"}}>Keine Einträge!</Text>
                                                </Surface>)}
                                        </ScrollView>
                                    </View>
                                </TabScreen>
                            );
                        })
                    }
                </Tabs>
            </TabsProvider>
        )
    }
    else {
        if (subs === undefined) {
            loadSubs();
        }

        return (
            <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
                <Surface style={{margin: 5, padding: 5, borderRadius: 15, alignItems: "center", flex: 1}}>
                    <Text variant={"bodyMedium"} style={{fontStyle: "italic"}}>Keine Einträge!</Text>
                </Surface>
            </SafeAreaView>
        )
    }
}