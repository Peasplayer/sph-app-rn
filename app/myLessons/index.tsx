import {router, useNavigation} from "expo-router";
import {useEffect, useState} from "react";
import {ActivityIndicator, Appbar, List, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, FlatList, Platform, View} from "react-native";
import Cache from "@/lib/Cache";
import {PreviewBook, Upload} from "sph-api/dist/MyLessons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Mime from "react-native-mime-types";
import * as IntentLauncher from "expo-intent-launcher";

export default function Index() {
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			loading ? <></> : <Appbar.Header elevated>
				<Appbar.BackAction onPress={router.back} />
				<Appbar.Content title="Mein Unterricht" />
			</Appbar.Header>)
		});
	})
	const theme = useTheme();
	const [loading, setLoading] = useState<boolean>(false);

	const [data, setData] = useState<PreviewBook[]>();
	const [loadingFile, setLoadingFile] = useState(false);

	if (data === undefined && !loading) {
		setLoading(true);

		Cache.currentSession.MyLessons.fetchCurrentEntries().then((r: PreviewBook[]) => {
			setData(r);
			setLoading(false);
		})
	}

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: theme.colors.background
			}}
		>
			{ loading ? <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
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
					<FlatList data={data} renderItem={(entry) => {
						const item = entry.item;
						//console.log(item);
						return (
							<View style={{borderRadius: 15, margin: 3, backgroundColor: theme.colors.elevation.level1}}>
								<List.Accordion
									title={item.title}
									right={props => <>
										{
											(item.entry?.homework !== undefined && !item.entry.homework.done
												|| item.entry?.uploads !== undefined && item.entry?.uploads?.filter(u => u.open).length > 0) ?
												<>
													{item.entry?.homework !== undefined && !item.entry.homework.done ?
														<List.Icon {...props} color="red" icon="home" /> : null}

													{item.entry?.uploads !== undefined && item.entry?.uploads?.filter(u => u.open).length > 0 ?
														<List.Icon {...props} color="orange" icon="upload" /> : null}
												</> :
												<List.Icon {...props} icon="dots-horizontal" />
										}
									</>}
									description={
										<>
											<Text>
												{item.teacher}
												{item.entry?.title !== undefined ?
													<Text style={{fontWeight: "bold"}}>{"\n" + item.entry.title}</Text> : null}
											</Text>
										</>
									}
									descriptionNumberOfLines={0}
									style={{borderTopStartRadius: 15, borderTopEndRadius: 15, backgroundColor: theme.colors.elevation.level1}}
								>
									<List.Item key={"view"} title={"Öffnen"} titleStyle={{fontWeight: "bold"}}
										// @ts-ignore
											   onPress={() => router.navigate("/myLessons/" + item.id)}
											   left={props => <List.Icon {...props} icon="eye-outline" />} />
									{item.entry?.date !== undefined ?
										<List.Item
											key={"date"}
											title={new Date(item.entry.date).toLocaleDateString("de").split(".").map(s => s.padStart(2, "0")).join(".")}
											left={props => <List.Icon {...props} icon="calendar-outline" />}
										/>
										: null}
									{item.entry?.title !== undefined ?
										<List.Item
											key={"title"}
											title={item.entry.title}
											titleNumberOfLines={0}
											left={props => <List.Icon {...props} icon="format-title" />}
										/>
										: null}
									{item.entry?.content !== undefined ?
										<List.Item
											key={"content"}
											title={"Inhalt"}
											description={item.entry.content}
											descriptionNumberOfLines={0}
											left={props => <List.Icon {...props} icon="text-box-outline" />}
										/>
										: null}
									{item.entry?.homework !== undefined ?
										<List.Item
											key={"homework"}
											title={"Hausaufgabe"}
											titleStyle={!item.entry.homework.done ? {fontWeight: "bold", color: theme.colors.errorContainer} : null}
											description={item.entry.homework.text}
											descriptionNumberOfLines={0}
											left={props => <List.Icon {...props} color={!item.entry?.homework?.done ? theme.colors.errorContainer : undefined} icon="home-outline" />}
											onPress={() => {
												Alert.alert("Bestätigung", "Soll die Hausaufgabe auf " + (!item.entry?.homework?.done ? "erledigt" : "nicht erledigt")
													+ " gesetzt werden?", [
													{text: 'Nein', onPress: () => {}, style: 'cancel'},
													{text: 'Ja', onPress: () => {
															setData(undefined);
															Cache.currentSession.MyLessons.checkHomework(item.id, item.entry?.id, !item.entry?.homework?.done);
														}, style: 'default'}]);
											}}
										/>
										: null}
									{item.entry?.files?.length !== undefined && item.entry?.files?.length > 0 ?
										<List.Item
											key={"files"}
											title={"Anhang"}
											description={item.entry.files.map((file) => <Text key={file.name} onPress={async() => {
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
													const req = await Cache.currentSession.MyLessons.fetchFileBlob(item.id, item.entry?.id, file.name);
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
									{item.entry?.uploads?.length !== undefined && item.entry?.uploads?.length > 0 ?
										<List.Item
											key={"uploads"}
											title={"Abgabe"}
											description={item.entry.uploads?.map((upload: Upload, index: number) =>
												<Text key={index}>
													<Text style={{color: upload.open ? "orange" : undefined, fontWeight: "bold"}}>{upload.title} {upload.open ? "(offen" + (upload.deadline ? " bis " + (new Date(upload.deadline)).toLocaleString("de") : "") + ")" : "(geschlossen)"}</Text>
													{upload.uploadedFiles.length > 0 ? "\n" + upload.uploadedFiles.join("\n") : null}
												</Text>
											)}
											descriptionNumberOfLines={0}
											left={props => <List.Icon {...props} icon="upload-outline" />}
										/>
										: null}
								</List.Accordion>
							</View>
						)
					}} />
				</>
			}
		</SafeAreaView>
	)
}