import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {Appbar, Chip, DataTable, List, Text, Title, useTheme} from "react-native-paper";
import * as React from "react";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, ScrollView, View} from "react-native";
import {GradeType, GradeValue} from "sph-api/dist/MyLessons";

export default function Exams() {
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
				<Appbar.Header elevated>
					<Appbar.BackAction onPress={router.back} />
					<Appbar.Content title={"Leistungskontrollen"} />
				</Appbar.Header>)
		});
	})
	const theme = useTheme();

	const { id } = useLocalSearchParams();
	const [data, setData] = useState<{ name: string, date: number }[]>();

	if (data === undefined) {
		Cache.currentSession.MyLessons.fetchExams(id).then((data: { name: string, date: number }[]) => {
			setData(data);
		})
	}

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
			<FlatList data={data} renderItem={(entry) => {
				const item = entry.item;
				return (
					<View style={{backgroundColor: theme.colors.elevation.level1, borderRadius: 15, margin: 3}}>
						<List.Item
							title={<Title style={{marginLeft: 5}}>{item.name}</Title>}
							right={_ => <Chip style={{alignSelf: "flex-end"}} icon={"calendar"}>{new Date(item.date).toLocaleDateString("de").split(".").map(s => s.padStart(2, "0")).join(".")}</Chip>}
						/>
					</View>
				)
			}} />
		</SafeAreaView>
	)
}