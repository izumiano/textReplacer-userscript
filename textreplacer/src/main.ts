const replacements: { [key: string]: string } = {};

const pattern = new RegExp(
	"\\b(" +
		Object.keys(replacements)
			.map((key) => key.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&"))
			.join("|") +
		")\\b",
	"gi",
);

function doTextReplace(text: string) {
	const newText = replacements[text.toLowerCase()];
	if (text.toUpperCase() === text) {
		return newText.toUpperCase();
	}
	if (text[0].toUpperCase() === text[0]) {
		return newText[0].toUpperCase() + newText.slice(1);
	}
	return newText;
}

function recursiveReplace(elem: ChildNode) {
	if (elem.nodeName === "FORM") {
		return;
	}

	if (elem.nodeType === Node.TEXT_NODE) {
		elem.nodeValue = elem.nodeValue?.replaceAll(pattern, doTextReplace) ?? null;
	}

	for (const child of elem.childNodes) {
		recursiveReplace(child);
	}
}

recursiveReplace(document.body);
