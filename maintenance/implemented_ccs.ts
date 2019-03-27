// tslint:disable: no-console
// tslint:disable-next-line: no-var-requires
require("reflect-metadata");
import * as c from "ansi-colors";
import * as fs from "fs-extra";
import * as path from "path";
import * as yargs from "yargs";
import { CommandClasses } from "../src/lib/commandclass/CommandClass";
import { num2hex } from "../src/lib/util/strings";

const ccRegex = /^@commandClass\(CommandClasses(?:\.|\[")(.+?)(?:"\])?\)/m;
const versionRegex = /^@implementedVersion\((\d+)\)/m;
const ansiColorRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

const onlyIncomplete = !!yargs.argv.onlyIncomplete;

function getSafeLength(str: string) {
	return str.replace(ansiColorRegex, "").length;
}

function padEnd(str: string, len: number) {
	return str + " ".repeat(len - getSafeLength(str));
}

(async () => {
	const ccDir = path.join(__dirname, "..", "src/lib/commandclass");
	const ccFiles = (await fs.readdir(ccDir))
		.filter(file => !file.endsWith("test.ts"))
		.map(file => path.join(ccDir, file))
		;

	const allCCs = new Map(Object.keys(CommandClasses)
		.filter(cc => Number.isNaN(+cc))
		.map(name => [name, 0] as [string, number]),
	);

	for (const ccFile of ccFiles) {
		const fileContent = await fs.readFile(ccFile, "utf8");
		try {
			const ccName = ccRegex.exec(fileContent)[1];
			const ccVersion = +versionRegex.exec(fileContent)[1];
			allCCs.set(ccName, ccVersion);
		} catch (e) { /* ok */ }
	}

	const headers = ["", "Command class name", "Implemented version", "max."];
	const rows = [];

	for (const [name, version] of allCCs.entries()) {
		const { version: latest, deprecated, obsolete } = getLatestVersion(name);
		if (obsolete) continue;
		const color =
			version === latest ? c.green
				: version > 0 ? c.yellow
				: deprecated ? c.reset
				: c.red;
		const prefix =
			version === latest ? "✓"
				: version > 0 ? "✍"
					: "✗";
		const postfix = deprecated ? " " + c.reset("(deprecated)") : "";
		if (version !== latest || !onlyIncomplete) {
			rows.push([color(prefix), color(name + postfix), color(version > 0 ? `Version ${version}` : "not implemented"), latest.toString()]);
		}
	}
	writeTable([headers, ...rows], yargs.argv.flavor === "github" ? "github" : "console");
})();

function writeTable(rows: string[][], flavor: "console" | "github") {
	const numColumns = rows[0].length;
	if (flavor === "console") {
		const columnLenghts: number[] = [];
		for (let col = 0; col < numColumns; col++) {
			columnLenghts.push(Math.max(...rows.map(row => getSafeLength(row[col]))));
		}
		const HR = "|-" + columnLenghts.map(len => "-".repeat(len)).join("-|-") + "-|";

		console.log(HR);
		for (let i = 0; i < rows.length; i++) {
			const row = "| " + rows[i].map((r, ri) => padEnd(r, columnLenghts[ri])).join(" | ") + " |";
			console.log(row);
			if (i === 0) console.log(HR);
		}
		console.log(HR);
	} else if (flavor === "github") {
		let HR = "|";
		for (let i = 0; i < numColumns; i++) HR += " --- |";

		for (let i = 0; i < rows.length; i++) {
			const row = "| " + rows[i].join(" | ") + " |";
			console.log(row);
			if (i === 0) console.log(HR);
		}

	}
}

function getLatestVersion(ccName: string) {
	const cc = CommandClasses[ccName as any] as any as number;
	const version = ccVersions[num2hex(cc, true)];
	if (version == undefined) {
		return {version: 0, obsolete: true };
	}
	return version;
}

// Taken from https://www.silabs.com/documents/login/miscellaneous/SDS13781-Z-Wave-Application-Command-Class-Specification.pdf
const ccVersions: Record<string, { version: string | number, deprecated?: boolean, obsolete?: boolean }> = {
	"0x9C": { version: 1, deprecated: true },
	"0x9D": { version: 1 },
	"0x5D": { version: 2 },
	"0x57": { version: 1 },
	"0x22": { version: 1 },
	"0x85": { version: 2 },
	"0x9B": { version: 1 },
	"0x59": { version: 3 },
	"0x66": { version: 1 },
	"0x20": { version: 2 },
	"0x36": { version: 1 },
	"0x80": { version: 1 },
	"0x30": { version: 2, deprecated: true },
	"0x25": { version: 2 },
	"0x46": { version: 1, deprecated: true },
	"0x5B": { version: 3 },
	"0x81": { version: 1 },
	"0x33": { version: 3 },
	"0x70": { version: 4 },
	"0x21": { version: 1 },
	"0x56": { version: 1, deprecated: true },
	"0x3A": { version: 1 },
	"0x3B": { version: 1 },
	"0x5A": { version: 1 },
	"0x62": { version: 3 },
	"0x4C": { version: 1 },
	"0x90": { version: 1 },
	"0x6F": { version: 1 },
	"0x7A": { version: 5 },
	"0x8C": { version: 1 },
	"0x7B": { version: 1, deprecated: true },
	"0x37": { version: 1 },
	"0x39": { version: 1 },
	"0x6D": { version: 1 },
	"0x6E": { version: 1 },
	"0x64": { version: 1 },
	"0x74": { version: 1 },
	"0x87": { version: 2 },
	"0x5C": { version: 1 },
	"0x6B": { version: 1 },
	"0x89": { version: 1 },
	"0x76": { version: 1, deprecated: true },
	"0x69": { version: 1 },
	"0x91": { version: 1 },
	"0x72": { version: 2 },
	"0xEF": { version: "N/A" },
	"0x32": { version: 5 },
	"0x3C": { version: 1 },
	"0x3D": { version: 2 },
	"0x3E": { version: 1 },
	"0x60": { version: 4 },
	"0x8E": { version: 3 },
	"0x8F": { version: 1 },
	"0x31": { version: 11 },
	"0x26": { version: 4 },
	"0x29": { version: 1, deprecated: true },
	"0x4D": { version: 2 },
	"0x34": { version: 3 },
	"0x67": { version: 2 },
	"0x52": { version: 2 },
	"0x00": { version: 1 },
	"0x77": { version: 1 },
	"0x78": { version: 1 },
	"0x71": { version: 8 },
	"0x73": { version: 1 },
	"0x3F": { version: 1 },
	"0x41": { version: 1 },
	"0x88": { version: 1, deprecated: true },
	"0x75": { version: 2 },
	"0x35": { version: 1, deprecated: true },
	"0x48": { version: 1 },
	"0x49": { version: 1 },
	"0x2B": { version: 1 },
	"0x2C": { version: 1 },
	"0x2D": { version: 1 },
	"0x53": { version: 4 },
	"0x4E": { version: 3, deprecated: true },
	"0x93": { version: 2 },
	"0x92": { version: 2 },
	"0x98": { version: 1 },
	"0x9F": { version: 1 },
	"0xF100": { version: "N/A" },
	"0x94": { version: 4 },
	"0x79": { version: "N/A" },
	"0x6C": { version: 1 },
	"0x4A": { version: 1 },
	"0x4B": { version: 1 },
	"0x44": { version: 4 },
	"0x45": { version: 2 },
	"0x40": { version: 3 },
	"0x42": { version: 2 },
	"0x47": { version: 1 },
	"0x43": { version: 3 },
	"0x8A": { version: 2 },
	"0x8B": { version: 1 },
	"0x55": { version: 2 },
	"0x63": { version: 1 },
	"0x86": { version: 3 },
	"0x84": { version: 2 },
	"0x6A": { version: 1 },
	"0x23": { version: 4 },
	"0x4F": { version: 1 },
	"0x5F": { version: 1 },
	"0x68": { version: 1 },
	"0x58": { version: 1 },
	"0x61": { version: 1 },
	"0x5E": { version: 2 },
};