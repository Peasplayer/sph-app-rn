import {Component} from "react";
import WebView from "react-native-webview";
import {View} from "react-native";

export default class BackgroundTasker extends Component<{onRef : (ref: BackgroundTasker) => void, dependencies?: string[]}> {
	#webView: WebView|null = null;
	#handlers: ((err?: string, data?: string) => void)[] = [];

	executeCode(code: string, callback: (err?: string, data?: string) => void) {
		if (this.#webView !== null) {
			this.#handlers.push(callback);
			const script =
				`try {
					function code() { ${code} };
					sendMessage(JSON.stringify({success: true, id: ${this.#handlers.length - 1}, data: code()}))
				}
				catch (err) {
					sendMessage(JSON.stringify({success: false, id: ${this.#handlers.length - 1}, data: err.toString()}))
				}
				true;`;
			this.#webView.injectJavaScript(script);
		}
	}

	componentDidMount() {
		if (this.props.onRef != null) {
			this.props.onRef (this)
		}
	}

	render() {
		return (<View style={{height: 0}}>
			<WebView
				ref={e => {
					this.#webView = e;
				}}
				source={{ html: `<html><head>
				${this.props.dependencies?.map(d => '<script type="text/javascript" src="' + d + '"></script>')}
				<script>function sendMessage(str) { window.ReactNativeWebView.postMessage(str); }</script>
			</head><body></body></html>`}}
				onMessage={(e) => {
					const data = JSON.parse(e.nativeEvent.data);
					this.#handlers[data.id](data.success ? undefined : data.data, !data.success ? undefined : data.data);
				}}
			/>
		</View>)
	}
}