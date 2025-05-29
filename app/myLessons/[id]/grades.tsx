import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {Appbar, Chip, List, Text, Title, useTheme} from "react-native-paper";
import * as React from "react";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, View} from "react-native";
import {Grade, GradeType, GradeValue} from "sph-api/dist/MyLessons";

export default function Grades() {
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			<Appbar.Header>
				<Appbar.BackAction onPress={router.back} />
				<Appbar.Content title={"Leistungen"} />
			</Appbar.Header>)
		});
	})
	const theme = useTheme();

	const { id } = useLocalSearchParams();
	const [data, setData] = useState<Grade[]>();

	if (data === undefined) {
		Cache.currentSession.MyLessons.fetchGrades(id).then((data: Grade[]) => {
			setData(data);
		})
	}

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
			<FlatList data={data} renderItem={(entry) => {
				const item = entry.item;
				return (
					<View style={{backgroundColor: item.type === GradeType.Final ? (theme.dark ? "#626F47" : "#dff0d8") : (item.type === GradeType.Interim ? (theme.dark ? "#CA7842" : "#fcf8e3") : theme.colors.elevation.level1), borderRadius: 15, margin: 3}}>
						<List.Item
							title={<Title style={{marginLeft: 5}}>{item.name}</Title>}
							description={<View style={{flexDirection: "row", flex: 1}}>
								<Chip style={{alignSelf: "flex-end"}} icon={"calendar"}>{new Date(item.date).toLocaleDateString("de").split(".").map(s => s.padStart(2, "0")).join(".")}</Chip>
								{item.note !== undefined ? <Chip style={{alignSelf: "flex-end", marginLeft: 5}} icon={"chat"}>{item.note}</Chip> : null}
							</View>}
							right={props =>
								<Text style={[{borderRadius: 500, padding: 5, backgroundColor: item.value === GradeValue.Bad
										? "#AC2925" : (item.value === GradeValue.Good ? "#5cb85c" : "#777")}, props.style]}>{item.grade}
								</Text>}
						/>
					</View>
				)
			}} />
		</SafeAreaView>
	)
}