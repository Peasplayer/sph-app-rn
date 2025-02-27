import {Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {ReactElement, useRef, useState} from "react";
import {Cell, Col, Cols, Row, Rows, Table, TableWrapper} from "react-native-reanimated-table";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView,} from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import Cache from "@/lib/Cache";
import {Badge, Button, Checkbox, IconButton} from "react-native-paper";
/*import Test from "@/components/test";
import Table from "@/components/table/Table";
import Row, {IRow} from "@/components/table/Row";
import Cell from "@/components/table/Cell";*/

export default function Schedule() {
    const [schedule, setSchedule] = useState<any>(undefined);
    const [tableData, setTableData] = useState<any[]>([]);
    const [subjectDetails, setSubjectDetails] = useState<any>(undefined);
    const [hiddenSubjects, setHiddenSubjects] = useState<any[]>([]);
    const [hiddenSubjectsModalVisible, setHiddenSubjectsModalVisible] = useState(false);
    const [showSubjectsFromOtherWeek, setShowSubjectsFromOtherWeek] = useState(false);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

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

    function SubjectCell(subject: any, _schedule: any) {
        const isThisWeek = !(subject.week !== undefined && _schedule.details?.currentWeek?.week !== subject.week);
        const color = isThisWeek ? stringToColour(subject.id) : "#3b3b3b";
        return (<TouchableOpacity onPress={() => showDetails(subject)} style={[styles.subjectCell, {backgroundColor: color, flexDirection: "row", flexWrap: "wrap"}]} key={subject.id}>
            <Text style={[{color: wc_hex_is_dark(color) ? "white": "black"}, (subject.week ? {marginRight: 4} : {})]}>{subject.subject}{/*subject.week !== undefined ? "  [" + subject.week + "]" : ""*/}</Text>
            {subject.week ? <Badge>{subject.week}</Badge> : <></>}
        </TouchableOpacity>)
    }

    // Credits: https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript#answer-16348977
    function stringToColour(str: string|undefined) {
        if (str == undefined)
            return undefined;

        let hash = 0;
        str.split('').forEach(char => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash)
        })
        let colour = '#'
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff
            colour += value.toString(16).padStart(2, '0')
        }
        return colour
    }

    // Credits: https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black#answer-51567564
    function wc_hex_is_dark(color: string|undefined) {
        if (color == undefined)
            return false;

        const hex = color.replace('#', '');
        const c_r = parseInt(hex.substring(0, 0 + 2), 16);
        const c_g = parseInt(hex.substring(2, 2 + 2), 16);
        const c_b = parseInt(hex.substring(4, 4 + 2), 16);
        const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
        return brightness < 155;
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
        displaySchedule(schedule, newArray);
    }

    function displaySchedule(_schedule: any|undefined = undefined, _hiddenSubjects: any[]|undefined = undefined, _showSubjectsFromOtherWeek: boolean|undefined = undefined) {
        _schedule = _schedule ?? schedule;
        _hiddenSubjects = _hiddenSubjects ?? hiddenSubjects;
        _showSubjectsFromOtherWeek = _showSubjectsFromOtherWeek ?? showSubjectsFromOtherWeek;

        setTableData([[
            <Header></Header>,
            <Header>Mo</Header>,
            <Header>Di</Header>,
            <Header>Mi</Header>,
            <Header>Do</Header>,
            <Header>Fr</Header>,
        ]].concat(_schedule.rows.map((row: any) => {
            let rowData = [];
            rowData.push(<View style={{flex: 1, borderTopWidth: 1, borderColor: "darkgrey"}}>{HourCell(row.hour.text ?? row.hour.number)}</View>);
            rowData = rowData.concat(row.subjects.map((hour: any) => {
                return (<View style={{flex:1, borderTopWidth: 1, borderColor: "darkgrey"}}>
                    {hour.filter((item:any) => !_hiddenSubjects.find(hs => hs.id === item.id))
                        .filter((item: any) => (_showSubjectsFromOtherWeek || (item.week === undefined || item.week === _schedule.details.currentWeek.week)))
                        .map((item: any) => SubjectCell(item, _schedule))}
                </View>);
                //Cell(hour.map((item: any) => item.subject).join(", "))
            }));
            return rowData;
        })));
    }

    if (schedule == undefined) {
        Cache.currentSession.Schedule.fetchStudentPlan().then((scheduleResult: any) => {
            AsyncStorage.getItem('schedule.hiddenSubjects').then((r) => {
                let data = scheduleResult.data;
                for (const row of data.rows) {
                    for (const day of row.subjects) {
                        for (const subject of day) {
                            if (subject.span !== undefined && subject.span > 1) {
                                for (let i = 1; i <= subject.span - 1; i++) {
                                    const newSubject = JSON.parse(JSON.stringify(subject));
                                    newSubject.span -= i;

                                    const cell = data.rows[data.rows.indexOf(row) + i].subjects[row.subjects.indexOf(day)];
                                    if (cell === undefined) {
                                        data.rows[data.rows.indexOf(row) + i].subjects[row.subjects.indexOf(day)] = [newSubject];
                                    }
                                    else {
                                        cell.push(newSubject);
                                    }
                                }
                            }
                        }
                    }
                }

                setHiddenSubjects(r ? JSON.parse(r) : [])

                setSchedule(data);
                displaySchedule(data, r ? JSON.parse(r) : undefined);
            });
        });
    }

    console.log("update")
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
                    <Pressable style={{backgroundColor: "black", opacity: 0.5,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0}}
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
                <ScrollView
                    horizontal={false}
                    style={{width: "100%"}}
                >
                    <View style={{flexDirection:"row", alignSelf: 'flex-end', justifyContent: "center"}}>
                        <IconButton icon={"filter"} size={24} mode={showSubjectsFromOtherWeek ? undefined : 'contained'} onPress={() => {
                            setShowSubjectsFromOtherWeek(!showSubjectsFromOtherWeek);
                            displaySchedule(undefined, undefined, !showSubjectsFromOtherWeek);
                        }} />
                        <IconButton icon={"eye-off"} size={24} onPress={() => setHiddenSubjectsModalVisible(true)} />
                        <IconButton icon={"information"} size={24} onPress={() => Alert.alert(schedule.details.title, schedule.details.currentWeek?.fullText ?? "")} />
                    </View>
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
