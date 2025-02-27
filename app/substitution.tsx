import {Alert, ScrollView, StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Button, Card, Chip, Divider, Icon, IconButton, Text, Title} from "react-native-paper";
import React from "react";
import Cache from "@/lib/Cache";

export default function Substitution() {
    const [subs, setSubs] = React.useState<any[]>();

    if (subs === undefined) {
        Cache.currentSession.SubstitutionPlan.fetchSubstitutionPlan().then((r: any) => {
            if (r.success) {
                console.log(r.data)
                setSubs(r.data);
            }
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {
                    subs ? subs.map((sub, i) => {
                        return <>
                            <View key={i} style={{flexDirection: "row", alignContent: "flex-start", flexWrap: "wrap", marginBottom: 5}}>
                                <Title>{sub.details.dayName}</Title>
                                {sub.details.relativeDay ? <Chip key={0} style={{marginLeft: 5, marginBottom: 5}}>{sub.details.relativeDay}</Chip> : <></>}
                                {sub.details.date ? <Chip key={1} style={{marginLeft: 5, marginBottom: 5}}>{sub.details.date.replaceAll("_", ".")}</Chip> : <></>}
                                {sub.details.updateTimeStamp.date ? <Chip key={2} icon={"update"} style={{marginLeft: 5, marginBottom: 5}}>{sub.details.updateTimeStamp.date + " " + sub.details.updateTimeStamp.time}</Chip> : <></>}
                            </View>
                            {(() => {
                                const entryCards = sub.content.entries.map((entry: any, i: number) => {
                                    return (
                                        <>
                                            <Card key={i} style={{padding: 5, marginBottom: 10}} mode={"contained"}>
                                                <Card.Content>
                                                    {entry.map((field: any, i: number) =>
                                                        field ? (<View style={{flexDirection: "row"}}>
                                                            <Text variant={"bodyMedium"}>{sub.content.fields[entry.indexOf(field)].name + ": "}</Text>
                                                            <Text variant={"bodyMedium"} style={{fontWeight: "bold"}}>{field}</Text></View>) : <></>
                                                    )}
                                                </Card.Content>
                                            </Card>
                                        </>
                                    )
                                })

                                if (entryCards.length === 0) {
                                    return (<Text variant={"bodyMedium"} style={{fontStyle: "italic"}}>Keine Einträge!</Text>)
                                }

                                return entryCards;
                            })()}
                        </>;
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