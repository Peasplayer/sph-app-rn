import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {Appbar, List, Menu, Text, useTheme} from "react-native-paper";
import * as React from "react";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, View} from "react-native";
import {DetailsBook} from "sph-api/dist/MyLessons";

export default function Entries() {
	const { id } = useLocalSearchParams();
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			<Appbar.Header elevated>
				<Appbar.BackAction onPress={router.back} />
				<Appbar.Content title={data?.title} />
				<Menu
					visible={menuOpen}
					style={{marginTop: 64}}
					onDismiss={() => setMenuOpen(false)}
					anchor={
						<Appbar.Action icon={"dots-horizontal"} onPress={() => setMenuOpen(true)} />}>
					<Menu.Item onPress={() => {
						setMenuOpen(false)
						// @ts-ignore
						router.navigate("/myLessons/" + id + "/grades")
					}} title="Leistungen" leadingIcon={"star"} />
					<Menu.Item onPress={() => {
						setMenuOpen(false)
						// @ts-ignore
						router.navigate("/myLessons/" + id + "/exams")
					}} title="Leistungskontrollen" leadingIcon={"pen"} />
					<Menu.Item onPress={() => {
						setMenuOpen(false)
						// @ts-ignore
						router.navigate("/myLessons/" + id + "/attendances")
					}} title="Anwesenheiten" leadingIcon={"format-list-bulleted"} />
				</Menu>
			</Appbar.Header>)
		});
	})
	const theme = useTheme();

	const [data, setData] = useState<DetailsBook>();
	const [menuOpen, setMenuOpen] = useState(false);

	if (data === undefined) {
		Cache.currentSession.MyLessons.fetchBookEntries(id).then((data: DetailsBook) => {
			setData(data);
		})
	}

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
			<FlatList data={data?.entries} renderItem={(entry) => {
				const item = entry.item;
				return (
					<View style={{backgroundColor: theme.colors.elevation.level1, borderRadius: 15, margin: 3}}>
						<List.Accordion
							title={item.title}
							titleNumberOfLines={0}
							right={props => <>
								{
									(item.homework !== undefined && !item.homework.done
										|| item.uploads !== undefined && item.uploads?.length > 0) ?
										<>
											{item.homework !== undefined && !item.homework.done ?
												<List.Icon {...props} color="red" icon="home" /> : null}

											{item.uploads !== undefined && item.uploads?.length > 0 ?
												<List.Icon {...props} color="orange" icon="upload" /> : null}
										</> :
										<List.Icon {...props} icon="dots-horizontal" />
								}
							</>}
							description={
								<Text>
									{new Date(item.date).toLocaleDateString("de")}   <Text style={{fontStyle: "italic"}}>{item.hour}</Text>
								</Text>
							}
							descriptionNumberOfLines={0}
							style={{borderRadius: 15}}
							// @ts-ignore
							backgroundColor={"transparent"}
						>
							{item.content !== undefined ?
								<List.Item
									key={"content"}
									title={"Inhalt"}
									description={item.content}
									descriptionNumberOfLines={0}
									left={props => <List.Icon {...props} icon="text-box-outline" />}
								/>
								: null}
							{item.homework !== undefined ?
								<List.Item
									key={"homework"}
									title={"Hausaufgabe"}
									titleStyle={!item.homework.done ? {fontWeight: "bold", color: theme.colors.errorContainer} : null}
									description={item.homework.text}
									descriptionNumberOfLines={0}
									left={props => <List.Icon {...props} color={!item.homework?.done ? theme.colors.errorContainer : undefined} icon="home-outline" />}
								/>
								: null}
							{item.files?.length > 0 ?
								<List.Item
									key={"files"}
									title={"Anhang"}
									description={item.files.map((file: any) => <Text key={file.name} onPress={() => console.log(file.name)}>{file.name + " (" + file.size + ")\n"}</Text>)}
									descriptionNumberOfLines={0}
									left={props => <List.Icon {...props} icon="paperclip" />}
								/>
								: null}
							{item.uploads?.length > 0 ?
								<List.Item
									key={"uploads"}
									title={"Abgabe"}
									description={props =>
										<View {...props}>
											{item.uploads?.map((upload: any, index: number) =>
												<View key={index}>
													<Text>
														<Text style={{color: upload.open ? "orange" : undefined, fontWeight: "bold"}}>{upload.title} {upload.open ? "(offen)" : "(geschlossen)"}</Text>
														{upload.uploads?.length > 0 ? "\n" + upload.uploadedFiles.join("\n") + "\n\n" : null}
													</Text>
												</View>
											)}
										</View>
									}
									left={props => <List.Icon {...props} icon="upload-outline" />}
								/>
								: null}
							{item.attendance !== undefined ?
								<List.Item
									key={"attendance"}
									title={"Anwesenheit"}
									description={item.attendance}
									descriptionNumberOfLines={0}
									left={props => <List.Icon {...props} icon="account-check-outline" />}
								/>
								: null}
						</List.Accordion>
					</View>
				)
			}} />
		</SafeAreaView>
	)
}