import {Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {Row, Table} from "react-native-reanimated-table";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView,} from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Cache from "@/lib/Cache";
import {Appbar, Badge, Button, SegmentedButtons, Text, Title} from "react-native-paper";
import Utils from "@/lib/Utils";
import {router, useNavigation} from "expo-router";

export default function Schedule() {
    const [schedule, setSchedule] = useState<any>(undefined);
    const [selectedSchedule, setSelectedSchedule] = useState<{ type: "own"|"all"|string, date: string|undefined }>({type: "own", date: undefined});
    const [tableData, setTableData] = useState<any[]>([]);
    const [subjectDetails, setSubjectDetails] = useState<any>(undefined);
    const [hiddenSubjects, setHiddenSubjects] = useState<any[]>([]);
    const [hiddenSubjectsVisible, setHiddenSubjectsVisible] = useState<boolean>(false);
    const [hiddenSubjectsModalVisible, setHiddenSubjectsModalVisible] = useState(false);
    const [showSubjectsFromOtherWeek, setShowSubjectsFromOtherWeek] = useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadSchedule(() => setRefreshing(false));
    }, []);

    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true, header: () => (
            <Appbar.Header>
                <Appbar.BackAction onPress={router.back} />
                <Appbar.Content title="Stundenplan" />
                <Appbar.Action icon={"filter"} size={24} mode={showSubjectsFromOtherWeek ? undefined : 'contained'} onPress={() => {
                    setShowSubjectsFromOtherWeek(!showSubjectsFromOtherWeek);
                    displaySchedule({showSubjectsFromOtherWeek: !showSubjectsFromOtherWeek});
                }} />
                <Appbar.Action
                    icon={hiddenSubjectsVisible ? "eye" : "eye-off"}
                    size={24}
                    onPress={() => {
                        setHiddenSubjectsVisible(!hiddenSubjectsVisible);
                        displaySchedule({hiddenSubjectsVisible: !hiddenSubjectsVisible});
                    }}
                    onLongPress={() => setHiddenSubjectsModalVisible(true)} />
            </Appbar.Header>)
        });
    })

    function Header(props: { children?: string }) {
        return (
            <View style={styles.header}>
                <Text style={{fontWeight: "bold"}}>{props.children ?? ""}</Text>
                {/*props.children ?
                    (<Text style={{borderRadius: 15, backgroundColor: "lightgrey", padding: 5, paddingHorizontal: 10, width: "auto"}}>0</Text>)
                    : <></>*/}
            </View>
        )
    }

    function HourCell(text: string) {
        return (<View style={styles.hourCell} key={text}>
            <Text>{text}</Text>
        </View>)
    }

    function SubjectCell(subject: any, index: number, _schedule: any) {
        const isThisWeek = !(subject.week !== undefined && _schedule.details?.currentWeek?.week !== subject.week);
        const color = isThisWeek ? Utils.stringToColour(subject.id) : "#3b3b3b";
        return (<TouchableOpacity onPress={() => showDetails(subject)} style={[styles.subjectCell, {backgroundColor: color, flexDirection: "row", flexWrap: "wrap"}]} key={subject.id + index.toString()}>
            <Text style={[{color: Utils.wc_hex_is_dark(color) ? "white": "black"}, (subject.week ? {marginRight: 4} : {})]}>{subject.subject}{/*subject.week !== undefined ? "  [" + subject.week + "]" : ""*/}</Text>
            {subject.week ? <Badge>{subject.week}</Badge> : <></>}
        </TouchableOpacity>)
    }

    function showDetails(subject: any) {
        setSubjectDetails(subject);
        bottomSheetModalRef.current?.present();
    }

    function hideSubject(subject: any) {
        hiddenSubjects.push(subject);
        AsyncStorage.setItem('schedule.hiddenSubjects', JSON.stringify(hiddenSubjects));
        displaySchedule();
    }

    function showSubject(subject: any) {
        const newArray = hiddenSubjects.filter(s => s.id !== subject.id);
        setHiddenSubjects(newArray)
        AsyncStorage.setItem('schedule.hiddenSubjects', JSON.stringify(newArray));
        displaySchedule({hiddenSubjects: newArray});
    }

    function displaySchedule(_options: {
        schedule?: any,
        hiddenSubjects?: any[],
        showSubjectsFromOtherWeek?: boolean,
        hiddenSubjectsVisible?: boolean
        scheduleType?: string
    }|undefined = undefined) {
        const options = {
            schedule: _options?.schedule ?? schedule,
            hiddenSubjects: _options?.hiddenSubjects ?? hiddenSubjects,
            showSubjectsFromOtherWeek: _options?.showSubjectsFromOtherWeek ?? showSubjectsFromOtherWeek,
            hiddenSubjectsVisible: _options?.hiddenSubjectsVisible ?? hiddenSubjectsVisible,
            scheduleType: _options?.scheduleType ?? selectedSchedule.type,
        }

        let scheduleData = getSelectedSchedule(options.schedule);

        if (scheduleData === undefined) {
            return;
        }

        setTableData([[
            <Header></Header>,
            <Header>Mo</Header>,
            <Header>Di</Header>,
            <Header>Mi</Header>,
            <Header>Do</Header>,
            <Header>Fr</Header>,
        ]].concat(scheduleData.rows.map((row: any) => {
            let rowData = [];
            rowData.push(<View style={{flex: 1, borderTopWidth: 1, borderColor: "darkgrey"}}>{HourCell(row.hour.number + (row.hour.duration > 1 ? ". - " + (row.hour.number + row.hour.duration - 1) : "") + ".\nStunde")}</View>);
            rowData = rowData.concat(row.subjects.map((day: any) => {
                return (<View style={{flex:1, borderTopWidth: 1, borderColor: "darkgrey"}}>
                    {day.filter((item:any) => !options.hiddenSubjects.find(hs => hs.id === item.id) || options.hiddenSubjectsVisible)
                        .filter((item: any) => (options.showSubjectsFromOtherWeek || (item.week === undefined || item.week === scheduleData.details.currentWeek.week)))
                        .map((item: any, index: number) => SubjectCell(item, index, scheduleData))}
                </View>);
            }));
            return rowData;
        })));
    }

    function mergeRows(rows: any[]) {
        const mergedRows = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            for (let j = i + 1; j < rows.length; j++) {
                const nextRow = rows[j];
                let same = true;
                for (let k = 0; k < nextRow.subjects.length; k++) {
                    if (row.subjects[k].length === nextRow.subjects[k].length) {
                        for (let l = 0; l < row.subjects[k].length; l++) {
                            if (row.subjects[k][l].id !== nextRow.subjects[k][l].id) {
                                same = false;
                            }
                        }
                    }
                    else {
                        same = false;
                    }
                }
                if (same) {
                    i++;
                    if (row.hour.duration === undefined) {
                        row.hour.duration = 1;
                    }
                    row.hour.duration++;
                }
            }
            mergedRows.push(row);
        }

        return mergedRows;
    }

    function splitSubjects(rows: any[]) {
        for (const row of rows) {
            for (const day of row.subjects) {
                for (const subject of day) {
                    if (subject.span !== undefined && subject.span > 1) {
                        for (let i = 1; i <= subject.span - 1; i++) {
                            const newSubject = JSON.parse(JSON.stringify(subject));
                            newSubject.span -= i;

                            const cell = rows[rows.indexOf(row) + i].subjects[row.subjects.indexOf(day)];
                            if (cell === undefined) {
                                rows[rows.indexOf(row) + i].subjects[row.subjects.indexOf(day)] = [newSubject];
                            }
                            else {
                                cell.push(newSubject);
                            }
                        }
                    }
                }
            }
        }

        return rows;
    }

    function loadSchedule(callback?: () => void) {
        Cache.currentSession.Schedule.fetchStudentPlan().then((scheduleResult: any) => {
            Cache.debugLog.push("Schedule fetch plan : " + JSON.stringify(scheduleResult))
            AsyncStorage.getItem('schedule.hiddenSubjects').then((r) => {
                let data = scheduleResult.data;
                if (data.own !== undefined) {
                    data.own.rows = mergeRows(splitSubjects(data.own.rows));
                }
                if (data.all !== undefined) {
                    data.all.rows = mergeRows(splitSubjects(data.all.rows));
                }
                if (data.unknown !== undefined) {
                    data.unknown.rows = mergeRows(splitSubjects(data.unknown.rows));
                }

                setHiddenSubjects(r ? JSON.parse(r) : [])

                setSchedule(data);
                displaySchedule({schedule: data, hiddenSubjects: r ? JSON.parse(r) : undefined});

                if (callback !== undefined) {
                    callback();
                }
            });
        });
    }

    function getSelectedSchedule(_schedule: any = schedule) {
        if (_schedule === undefined)
            return undefined;
        if (_schedule[selectedSchedule.type] !== undefined)
            return _schedule[selectedSchedule.type];

        if (_schedule.unknown !== undefined)
            return _schedule.unknown;

        if (selectedSchedule.type === "own" && _schedule.own === undefined && _schedule.all !== undefined) {
            setSelectedSchedule({type: "all", date: selectedSchedule.date});
            return _schedule.all;
        }

        if (selectedSchedule.type === "all" && _schedule.all === undefined && _schedule.own !== undefined) {
            setSelectedSchedule({type: "own", date: selectedSchedule.date});
            return _schedule.own;
        }
    }

    if (schedule == undefined) {
        loadSchedule();
    }

    return (
        <GestureHandlerRootView
            style={styles.container}
        >
            <BottomSheetModalProvider>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={hiddenSubjectsModalVisible}
                    onRequestClose={() => {
                        setHiddenSubjectsModalVisible(!hiddenSubjectsModalVisible);
                    }}
                >
                    <Pressable
                        style={{
                            backgroundColor: "black",
                            opacity: 0.5,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0
                        }}
                        onPress={() => {setHiddenSubjectsModalVisible(false)}}
                    />
                    <View style={{flex: 1, alignItems:"center", justifyContent:"center"}}>
                        <View style={{backgroundColor: "white", opacity: 1, alignSelf: "center", padding: 20, width:"80%", maxHeight: "90%"}}>
                            <Text style={{fontWeight: "bold", fontSize: 24}}>Ausgeblendete Kurse</Text>
                            <Text style={{textDecorationLine: "underline", fontSize: 18}}>(Anklicken zum einblenden)</Text>
                            <ScrollView>
                                {hiddenSubjects.length > 0 ?
                                    (hiddenSubjects.map((subject: any) => {
                                        return (<TouchableOpacity style={{flexDirection: "row"}} onPress={() => showSubject(subject)} key={subject.id}><Text style={{fontWeight: "bold"}}>{subject.subject}</Text><Text> bei {subject.teacher}</Text></TouchableOpacity>)
                                    }))
                                    : (<Text style={{fontStyle: "italic"}}>Noch nichts ausgeblendet :)</Text>)}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
                {
                    getSelectedSchedule() ? (<>
                        { getSelectedSchedule().details.currentWeek !== undefined ? (
                            <View style={{alignSelf: "flex-end"}}>
                                <Text>{getSelectedSchedule().details.currentWeek?.fullText ?? ""}</Text>
                            </View>
                        ) : (<></>)}
                        <View style={{width: "100%", padding: 5, alignItems: "center"}}>
                            {
                                schedule.own !== undefined && schedule.all !== undefined && true ? (
                                    <SegmentedButtons
                                        buttons={[{value: "own", label: "Persönlich"}, {value: "all", label: "Lerngruppe " + schedule.all.details.title.split(" ").reverse()[0]}]}
                                        value={selectedSchedule.type}
                                        onValueChange={v => {
                                            setSelectedSchedule({
                                                type: v,
                                                date: selectedSchedule.date
                                            });
                                            displaySchedule({scheduleType: v});
                                        }}
                                    />
                                ) : (
                                    schedule.own !== undefined ? (<Title>Persönlich</Title>) : (
                                        schedule.all !== undefined ? (<Title>Lerngruppe {schedule.all.details.title.split(" ").reverse()[0]}</Title>) : (<></>)
                                    )
                                )
                            }
                        </View>
                    </>) : (<></>)
                }
                <ScrollView
                    horizontal={false}
                    style={{width: "100%"}}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <Table style={{borderRadius: 5, backgroundColor: "lightgrey"}}>
                        {
                            tableData.map((rowData: any[], index: React.Key | null | undefined) => {
                                return (
                                    <Row
                                        key={index}
                                        data={rowData}
                                    />
                                )
                            })
                        }
                    </Table>
                </ScrollView>
                <BottomSheetModal
                    ref={bottomSheetModalRef}
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
                    <BottomSheetView style={{flexDirection: "column", alignContent: "center"}}>
                        <Text style={{fontWeight: "bold", fontSize: 24, alignSelf: "center"}}>{subjectDetails?.subject}</Text>
                        {subjectDetails?.teacher ? <Row data={[<Text style={{alignSelf: "flex-end"}}>bei </Text>, <Text style={{fontWeight: "bold"}}>{subjectDetails.teacher}</Text>]} /> : <></>}
                        {subjectDetails?.room ? <Row data={[<Text style={{alignSelf: "flex-end"}}>in </Text>, <Text style={{fontWeight: "bold"}}>{subjectDetails.room}</Text>]} /> : <></>}
                        {subjectDetails?.group ? <Row data={[<Text style={{alignSelf: "flex-end"}}>bei Gruppe </Text>, <Text style={{fontWeight: "bold"}}>{subjectDetails.group}</Text>]} /> : <></>}
                        {subjectDetails?.week ? <Row data={[<Text style={{alignSelf: "flex-end"}}>nur in Woche </Text>, <Text style={{fontWeight: "bold"}}>{subjectDetails.week}</Text>]} /> : <></>}
                        <Button style={{backgroundColor: "red", marginRight: 3, marginBottom: 3, alignSelf:"flex-end"}} icon="eye-off" mode="contained" onPress={() => {
                            hideSubject(subjectDetails);
                            bottomSheetModalRef.current?.close();
                        }}>
                            Ausblenden
                        </Button>
                    </BottomSheetView>
                </BottomSheetModal>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    header: {
        alignItems: "center",
        padding: 4,
        flex: 1, borderBottomWidth: 1, borderColor: "darkgrey"
    },
    hourCell: {
        flexDirection: "column",
        alignSelf: "center",
        flex: 1,
        margin: 2,
        padding: 2,
    },
    subjectCell: {
        flexDirection: "column",
        flex: 1,
        margin: 2,
        padding: 2,
        borderRadius: 3
    },
});
