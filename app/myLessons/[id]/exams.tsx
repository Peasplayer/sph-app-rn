import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {ActivityIndicator, Appbar, Chip, List, Text, Title, useTheme} from "react-native-paper";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, View} from "react-native";

export default function Exams() {
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			loading ? <></> : <Appbar.Header elevated>
				<Appbar.BackAction onPress={router.back} />
				<Appbar.Content title={"Leistungskontrollen"} />
			</Appbar.Header>)
		});
	})
	const theme = useTheme();
	const [loading, setLoading] = useState(false);

	const { id } = useLocalSearchParams();
	const [data, setData] = useState<{ name: string, date: number }[]>();

	if (data === undefined && !loading) {
		setLoading(true);
		Cache.currentSession.MyLessons.fetchExams(id).then((data: { name: string, date: number }[]) => {
			setData(data);
			setLoading(false);
		})
	}

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
			{loading ? <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
					<Text variant={"titleLarge"}>Lädt...</Text>
					<ActivityIndicator animating={true} size={"large"} />
				</View> :
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
			}
		</SafeAreaView>
	)
}