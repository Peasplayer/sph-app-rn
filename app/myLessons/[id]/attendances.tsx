import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {Appbar, DataTable, useTheme} from "react-native-paper";
import * as React from "react";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import {ScrollView} from "react-native";

export default function Attendances() {
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			<Appbar.Header elevated>
				<Appbar.BackAction onPress={router.back} />
				<Appbar.Content title={"Anwesenheiten"} />
			</Appbar.Header>)
		});
	})
	const theme = useTheme();

	const { id } = useLocalSearchParams();
	const [data, setData] = useState<{ name: string, hours: string }[]>();

	if (data === undefined) {
		Cache.currentSession.MyLessons.fetchAttendances(id).then((data: { name: string, hours: string }[]) => {
			setData(data);
		})
	}

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
			<DataTable>
				<DataTable.Header>
					<DataTable.Title textStyle={{fontWeight: "bold", color: theme.colors.onBackground}}>Art</DataTable.Title>
					<DataTable.Title numeric>Stunden</DataTable.Title>
				</DataTable.Header>
				<ScrollView>
					{data !== undefined ? data.map((attendance, i) => {
						return (<DataTable.Row key={i}>
							<DataTable.Cell>{attendance.name}</DataTable.Cell>
							<DataTable.Cell numeric>{attendance.hours}</DataTable.Cell>
						</DataTable.Row>)
					}) : null}
				</ScrollView>
			</DataTable>
		</SafeAreaView>
	)
}