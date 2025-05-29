import {router, useNavigation} from "expo-router";
import React, {useEffect, useState} from "react";
import {Appbar, List, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, View} from "react-native";
import Cache from "@/lib/Cache";
import {PreviewBook, Upload} from "sph-api/dist/MyLessons";

export default function Index() {
	const navigation = useNavigation();
	useEffect(() => {
		navigation.setOptions({ headerShown: true, header: () => (
			<Appbar.Header elevated>
				<Appbar.BackAction onPress={router.back} />
				<Appbar.Content title="Mein Unterricht" />
			</Appbar.Header>)
		});
	})
	const theme = useTheme();

	const [data, setData] = useState<PreviewBook[]>();

	if (data === undefined) {
		Cache.currentSession.MyLessons.fetchCurrentEntries().then((r: PreviewBook[]) => {
			setData(r);
		})
	}

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: theme.colors.background
			}}
		>
			<FlatList data={data} renderItem={(entry) => {
				const item = entry.item;
				//console.log(item);
				return (
					<View style={{backgroundColor: theme.colors.elevation.level1, borderRadius: 15, margin: 3}}>
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
							style={{borderRadius: 15}}
							// @ts-ignore
							backgroundColor={"transparent"}
						>
							<List.Item key={"view"} title={"Öffnen"} titleStyle={{fontWeight: "bold"}}
									   // @ts-ignore
									   onPress={() => router.navigate("/myLessons/" + item.id)}
									   left={props => <List.Icon {...props} icon="eye-outline" />} />
							{item.entry?.date !== undefined ?
								<List.Item
									key={"date"}
									title={new Date(item.entry.date).toLocaleDateString("de")}
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
								/>
								: null}
							{item.entry?.files?.length !== undefined && item.entry?.files?.length > 0 ?
								<List.Item
									key={"files"}
									title={"Anhang"}
									description={item.entry.files.map((file: any) => <Text key={file.name} onPress={() => console.log(file.name)}>{file.name + " (" + file.size + ")\n"}</Text>)}
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
											{"\n"}{upload.uploadedFiles.join("\n")}{"\n\n"}
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
		</SafeAreaView>
	)
}