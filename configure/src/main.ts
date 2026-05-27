import "./style.css";
import { logError, logVerbose, trace } from "@izumiano/vite-logger";
import { downloadObjectAsFile } from "./utils";
import { localStorageMapKey } from "../../shared/consts";

const cssPrepend = "izumiano-textreplacer-";

document.body.style.overflow = "hidden";

const configureContainer = document.createElement("div");
configureContainer.classList.add(`${cssPrepend}configureContainer`);

const statusMessage = document.createElement("span");
statusMessage.classList.add(`${cssPrepend}statusMessage`);

const divider = document.createElement("hr");

const importExportHeader = document.createElement("h2");
importExportHeader.innerText = "Import/Export";

const importLabel = document.createElement("label");
importLabel.htmlFor = "importInput";
importLabel.innerText = "Import file:";

const importInput = document.createElement("input");
importInput.id = "importInput";
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
		statusMessage.innerText = "Failed parsing JSON";
		return;
	}

	statusMessage.innerText = "Successfully imported file";
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
		statusMessage.innerText = "Failed parsing JSON";
	}
};

createReplacementList();
configureContainer.appendChild(divider);
configureContainer.appendChild(importExportHeader);
configureContainer.appendChild(importLabel);
configureContainer.appendChild(importInput);
configureContainer.appendChild(exportButton);
configureContainer.appendChild(statusMessage);

document.body.appendChild(configureContainer);

function save(replacementList: HTMLElement) {
	trace();

	let valid = true;
	const map: { [key: string]: string } = {};
	for (
		let rowIndex = 1;
		rowIndex < replacementList.children.length / 3;
		rowIndex++
	) {
		const i = rowIndex * 3;
		const key = replacementList.children[i] as HTMLInputElement;
		const value = replacementList.children[i + 1] as HTMLInputElement;

		if (!key.value) {
			key.setCustomValidity("Cannot be empty");
			valid = false;
		}
		if (!value.value) {
			value.setCustomValidity("Cannot be empty");
			valid = false;
		}

		map[key.value] = value.value;
	}

	if (!valid) {
		statusMessage.innerText = "Input's cannot be empty";
		return;
	}

	const sortedMap = Object.keys(map)
		.sort()
		.reduce((obj: { [key: string]: string }, key) => {
			obj[key] = map[key];
			return obj;
		}, {});

	try {
		logVerbose(sortedMap);
		const text = JSON.stringify(sortedMap);
		localStorage.setItem(localStorageMapKey, text);
		statusMessage.innerText = "Saved successsfully!";
	} catch (ex) {
		statusMessage.innerText = "Failed saving!";
		logError(ex);
	}
}

function createListItem(
	replacementList: HTMLElement,
	searchValue: string,
	replacementValue: string,
) {
	trace();

	const searchValueElem = document.createElement("input");
	searchValueElem.value = searchValue;
	searchValueElem.onchange = () => {
		searchValueElem.setCustomValidity("");
	};
	const replacementValueElem = document.createElement("input");
	replacementValueElem.value = replacementValue;
	replacementValueElem.onchange = () => {
		replacementValueElem.setCustomValidity("");
	};

	const deleteButton = document.createElement("button");
	deleteButton.innerText = "X";
	deleteButton.onclick = () => {
		replacementList.removeChild(searchValueElem);
		replacementList.removeChild(replacementValueElem);
		replacementList.removeChild(deleteButton);
	};

	return [searchValueElem, replacementValueElem, deleteButton];
}

function createReplacementList() {
	trace();

	const replacementList = document.createElement("div");
	replacementList.classList.add(`${cssPrepend}replacementList`);
	replacementList.onkeyup = (e) => {
		if (e.key !== "Enter") {
			return;
		}

		save(replacementList);
	};

	const searchValueHeader = document.createElement("h3");
	searchValueHeader.innerText = "Search:";
	searchValueHeader.classList.add("header");
	const replacementValueHeader = document.createElement("h3");
	replacementValueHeader.innerText = "Replacement:";
	replacementValueHeader.classList.add("header");
	const fillerHeader = document.createElement("h3");
	fillerHeader.classList.add("header");

	const addButton = document.createElement("button");
	addButton.innerText = "Add";
	addButton.onclick = () => {
		const elems = createListItem(replacementList, "", "");
		elems.toReversed().forEach((elem) => {
			const firstElem = replacementList.children[3];
			replacementList.insertBefore(elem, firstElem);
		});
		elems[0].focus();
	};

	const saveButton = document.createElement("button");
	saveButton.innerText = "Save";
	saveButton.onclick = () => {
		save(replacementList);
	};

	const items = JSON.parse(
		localStorage.getItem(localStorageMapKey) ?? '{"":""}',
	) as { [key: string]: string };

	replacementList.appendChild(searchValueHeader);
	replacementList.appendChild(replacementValueHeader);
	replacementList.appendChild(fillerHeader);

	for (const [key, value] of Object.entries(items)) {
		createListItem(replacementList, key, value).forEach((elem) => {
			replacementList.appendChild(elem);
		});
	}

	configureContainer.appendChild(addButton);
	configureContainer.appendChild(replacementList);
	configureContainer.appendChild(saveButton);
}
