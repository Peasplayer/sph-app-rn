import {RefreshControl, ScrollView, View} from "react-native";
import {Appbar, Card, Chip, Icon, Surface, Text} from "react-native-paper";
import React, {useEffect} from "react";
import Cache from "@/lib/Cache";
import {router, useNavigation} from "expo-router";
import {Row} from "react-native-reanimated-table";
import {Tabs, TabScreen, TabsProvider} from "react-native-paper-tabs";

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

    if (subs !== undefined && subs.length > 0) {
        return (
            <TabsProvider>
                <Tabs
                    // uppercase={false} // true/false | default=true (on material v2) | labels are uppercase
                    // showTextLabel={false} // true/false | default=false (KEEP PROVIDING LABEL WE USE IT AS KEY INTERNALLY + SCREEN READERS)
                    //iconPosition={"top"} // leading, top | default=leading
                    // style={{ backgroundColor:'#fff' }} // works the same as AppBar in react-native-paper
                    // dark={false} // works the same as AppBar in react-native-paper
                    // theme={} // works the same as AppBar in react-native-paper
                    mode="scrollable" // fixed, scrollable | default=fixed
                    showLeadingSpace={false} //  (default=true) show leading space in scrollable tabs inside the header
                    // disableSwipe={false} // (default=false) disable swipe to left/right gestures
                    tabHeaderStyle={{marginHorizontal: 1}} // style object, can be animated properties as well in
                    // tabLabelStyle // style object
                >
                    {
                        subs.map((sub, i) => {
                            const updateDate = new Date(sub.details.updateTimeStamp);

                            return (
                                <TabScreen
                                    key={i}
                                    icon={sub.content.entries.length <= 9 ? "numeric-" + sub.content.entries.length + "-circle" : "numeric-9-plus-circle"}
                                    label={`${sub.details.dayName}${sub.details.relativeDay ? `\n[${sub.details.relativeDay}]` : "\n⠀"}`.toUpperCase()}
                                >
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
                                                            {entry.filter((f: any) => f !== undefined).map((field: any, j: number) =>
                                                                <View key={j}>
                                                                    <Row data={[
                                                                        <View style={{flexDirection: "row", alignItems: "center"}}>
                                                                            <View style={{marginRight: 5}}>
                                                                                <Icon size={15} source={(() => {
                                                                                    const key = sub.content.fields[entry.indexOf(field)].key;
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
                                                                        <Text variant={"bodyMedium"} style={{fontWeight: "bold"}}>{field ?? ""}</Text>]} flexArr={[1, 2]}>
                                                                    </Row>
                                                                </View>
                                                            )}
                                                        </Card.Content>
                                                    </Card>
                                                )
                                            })
                                            : (<Surface style={{margin: 5, padding: 5, borderRadius: 15, alignItems: "center"}}>
                                                <Text variant={"bodyMedium"} style={{fontStyle: "italic"}}>Keine Einträge!</Text>
                                            </Surface>)}
                                    </ScrollView>
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

        return (<Surface style={{margin: 5, padding: 5, borderRadius: 15, alignItems: "center"}}>
            <Text variant={"bodyMedium"} style={{fontStyle: "italic"}}>Keine Einträge!</Text>
        </Surface>)
    }
}