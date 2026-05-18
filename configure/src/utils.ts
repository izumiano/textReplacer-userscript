export type MimeType =
	| "text/plain"
	| "text/html"
	| "text/css"
	| "application/javascript"
	| "application/json";
export function downloadObjectAsFile({
	fileName,
	data,
	mimeType,
	excludeKeys,
	jsonSpace,
}: { fileName: string } & (
	| ({
			data: object;
			mimeType?: "application/json";
			excludeKeys?: string[];
			jsonSpace?: string | number;
	  } extends infer JsonObj extends { mimeType?: MimeType }
			? JsonObj
			: never)
	| {
			data: string;
			mimeType?: MimeType;
			excludeKeys?: undefined;
			jsonSpace?: undefined;
	  }
)) {
	mimeType ??= "text/plain";
	excludeKeys ??= [];

	const a = document.createElement("a");
	a.href = `data:${mimeType};charset=utf-8,${encodeURIComponent(
		typeof data === "string"
			? data
			: JSON.stringify(
					data,
					(key, value) => {
						if (excludeKeys.includes(key)) {
							return undefined;
						}
						return value;
					},
					jsonSpace,
				),
	)}`;
	a.download = fileName;

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
