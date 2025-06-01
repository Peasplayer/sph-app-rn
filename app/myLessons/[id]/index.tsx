import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {ActivityIndicator, Appbar, List, Menu, Text, useTheme} from "react-native-paper";
import * as React from "react";
import Cache from "@/lib/Cache";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, FlatList, Platform, View} from "react-native";
import {DetailsBook} from "sph-api/dist/MyLessons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Mime from "react-native-mime-types";
import * as IntentLauncher from "expo-intent-launcher";

export default function Entries() {
	const { id } = useLocalSearchParams();
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			loading ? <></> : <Appbar.Header elevated>
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
	const [loading, setLoading] = useState(false);

	const [data, setData] = useState<DetailsBook>();
	const [menuOpen, setMenuOpen] = useState(false);
	const [loadingFile, setLoadingFile] = useState(false);

	if (data === undefined && !loading) {
		setLoading(true);

		Cache.currentSession.MyLessons.fetchBookEntries(id).then((data: DetailsBook) => {
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
				<>
					{ loadingFile ?
						<View style={{
							position: 'absolute',
							left: 0,
							top: 0,
							alignItems: 'center',
							justifyContent: 'center',
							height: "100%",
							width: "100%",
							zIndex: 100,
							backgroundColor: "rgba(0,0,0,0.3)"
						}}>
							<ActivityIndicator size='large' />
						</View> : null
					}
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
														<List.Icon {...props} color={item.uploads?.filter(u => u.open).length > 0 ? "orange" : undefined} icon="upload" /> : null}
												</> :
												<List.Icon {...props} icon="dots-horizontal" />
										}
									</>}
									description={
										<Text>
											{new Date(item.date).toLocaleDateString("de").split(".").map(s => s.padStart(2, "0")).join(".")}   <Text style={{fontStyle: "italic"}}>{item.hour}</Text>
										</Text>
									}
									descriptionNumberOfLines={0}
									style={{borderTopStartRadius: 15, borderTopEndRadius: 15, backgroundColor: theme.colors.elevation.level1}}
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
											onPress={() => {
												Alert.alert("Bestätigung", "Soll die Hausaufgabe auf " + (!item.homework?.done ? "erledigt" : "nicht erledigt")
													+ " gesetzt werden?", [
													{text: 'Nein', onPress: () => {}, style: 'cancel'},
													{text: 'Ja', onPress: () => {
															setData(undefined);
															Cache.currentSession.MyLessons.checkHomework(id, item.id, !item.homework?.done)
														}, style: 'default'}]);
											}}
										/>
										: null}
									{item.files?.length > 0 ?
										<List.Item
											key={"files"}
											title={"Anhang"}
											description={item.files.map((file: any) => <Text key={file.name} onPress={async() => {
												try {
													setLoadingFile(true);
													const fr = new FileReader();
													fr.onload = async () => {
														const fileUri = `${FileSystem.cacheDirectory}/${file.name}`;
														await FileSystem.writeAsStringAsync(fileUri, fr.result?.toString().split(',')[1] as string, { encoding: FileSystem.EncodingType.Base64 });

														setLoadingFile(false);
														if (Platform.OS === 'ios') {
															// iOS: Use sharing sheet
															await Sharing.shareAsync(fileUri);
														} else if (Platform.OS === 'android') {
															// Android: Use IntentLauncher
															const mimeType = Mime.lookup(fileUri) || 'application/octet-stream';
															await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
																data: await FileSystem.getContentUriAsync(fileUri),
																flags: 1,
																type: mimeType,
															});
														}
													};
													const req = await Cache.currentSession.MyLessons.fetchFileBlob(id, item.id, file.name);
													fr.readAsDataURL(req);
												}
												catch (e) {
													setLoadingFile(false);
													console.log(e);
												}
											}}>{file.name + " (" + file.size + ")\n"}</Text>)}
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
				</>}
		</SafeAreaView>
	)
}