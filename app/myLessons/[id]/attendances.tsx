import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {ActivityIndicator, Appbar, DataTable, Text, useTheme} from "react-native-paper";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import {ScrollView, View} from "react-native";

export default function Attendances() {
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			loading ? <></> : <Appbar.Header elevated>
				<Appbar.BackAction onPress={router.back} />
				<Appbar.Content title={"Anwesenheiten"} />
			</Appbar.Header>)
		});
	})
	const theme = useTheme();
	const [loading, setLoading] = useState(false);

	const { id } = useLocalSearchParams();
	const [data, setData] = useState<{ name: string, hours: string }[]>();

	if (data === undefined && !loading) {
		setLoading(true);

		Cache.currentSession.MyLessons.fetchAttendances(id).then((data: { name: string, hours: string }[]) => {
			setData(data);
			setLoading(false);
		})
	}

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
			{ loading ? <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
					<Text variant={"titleLarge"}>Lädt...</Text>
					<ActivityIndicator animating={true} size={"large"} />
				</View> :
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
				</DataTable>}
		</SafeAreaView>
	)
}