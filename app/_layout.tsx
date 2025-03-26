import { Stack } from "expo-router";
import BackgroundTasker from "@/lib/BackgroundTasker";
import Cache from "@/lib/Cache";
import {PaperProvider} from "react-native-paper";

export default function RootLayout() {
  return <PaperProvider>
    <BackgroundTasker onRef={ref => Cache.CryptoTasker = ref} dependencies={["https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"]} />
    <Stack screenOptions={{headerShown: false}} />
  </PaperProvider>;
}
