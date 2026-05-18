import "./style.css";
import { logError, logVerbose } from "@izumiano/vite-logger";
import { downloadObjectAsFile } from "./utils";
import { localStorageMapKey } from "../../shared/consts";

const configureContainer = document.createElement("div");
configureContainer.classList.add("configureContainer");

const inputMessage = document.createElement("span");

const importInput = document.createElement("input");
importInput.type = "file";
importInput.oninput = async () => {
	const file = importInput.files?.[0];

	if (!file) {
		return;
	}

	try {
		const json = JSON.parse(await file.text());

		let out = json;

		if (Array.isArray(json)) {
			out = json.reduce((prev, curr) => {
				// biome-ignore lint/performance/noAccumulatingSpread: <its fine>
				return { ...prev, [curr[0]]: curr[1] };
			}, {});
		}

		logVerbose(out);

		const text = JSON.stringify(out);
		localStorage.setItem(localStorageMapKey, text);
	} catch (ex) {
		logError(ex);
		inputMessage.innerText = "Failed parsing JSON";
		return;
	}

	inputMessage.innerText = "Successfully imported file";
};

const exportButton = document.createElement("button");
exportButton.innerText = "Export";
exportButton.onclick = () => {
	try {
		const json = JSON.parse(
			localStorage.getItem("izumiano_textreplacer-map") ?? "{}",
		);
		downloadObjectAsFile({
			fileName: "textReplacer-map",
			data: json,
			mimeType: "application/json",
			jsonSpace: 2,
		});
	} catch (ex) {
		logError(ex);
		inputMessage.innerText = "Failed parsing JSON";
	}
};

configureContainer.appendChild(importInput);
configureContainer.appendChild(inputMessage);
configureContainer.appendChild(exportButton);

document.body.appendChild(configureContainer);
