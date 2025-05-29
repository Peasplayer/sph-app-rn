import {SafeAreaView} from "react-native-safe-area-context";
import {List, Searchbar, Text, Title, TouchableRipple, useTheme} from "react-native-paper";
import {useState} from "react";
import {FlatList} from "react-native";
import * as React from "react";
import Cache from "@/lib/Cache";
import {router} from "expo-router";

export default function SchoolList() {
	const theme = useTheme();

	const [searchQuery, setSearchQuery] = useState('');
	const [data, setData] = useState<{name: string, id: string, city: string}[]>();

	if (data === undefined) {
		Cache.currentSession.fetchSchoolList().then((data: any) => {
			const schools: {name: string, id: string, city: string}[] = [];
			data.forEach((item: any) => {
				item.Schulen.forEach((school: any) => {
					schools.push({name: school.Name, id: school.Id, city: school.Ort});
				});
			});
			setData(schools);
		})
	}

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background, padding: 5}}>
			<Searchbar
				style={{marginBottom: 10}}
				placeholder="Schule"
				onChangeText={setSearchQuery}
				value={searchQuery}
			/>

			<FlatList data={data?.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery))} renderItem={(entry) => {
				const item = entry.item;

				return (
					<TouchableRipple
						style={{backgroundColor: theme.colors.elevation.level1, borderRadius: 15, margin: 3}}
						// @ts-ignore
						onPress={() => router.navigate("/login?school=" + JSON.stringify(item))}
						rippleColor="rgba(0, 0, 0, .32)"
						borderless
					>
						<List.Item
							title={<><Title style={{marginLeft: 5}}>{item.name} </Title><Text style={{fontStyle: "italic"}}>{item.id}</Text></>}
							description={<Text style={{fontWeight: "bold"}}> {item.city}</Text>}
						/>
					</TouchableRipple>
				)
			}} />
		</SafeAreaView>
	)
}