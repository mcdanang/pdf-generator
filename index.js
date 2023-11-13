const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const hbs = require("handlebars");
const path = require("path");
const investors = require("./investors.json");

const compile = async function (templateName, data) {
	const filePath = path.join(process.cwd(), `${templateName}.hbs`);
	const html = await fs.readFile(filePath, "utf-8");
	return hbs.compile(html)(data);
};

const saveAsPdf = async (data, index) => {
	try {
		const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
		const page = await browser.newPage();

		const content = await compile("akad-wakalah", data);
		await page.setContent(content, { waitUntil: ["load", "networkidle0", "domcontentloaded"] });
		await page.emulateMediaType("screen");

		const result = await page.pdf({
			path: `pdfs/MCINVEST-SPRA05${("0" + (index + 1)).slice(-2)}-${data.name.replace(
				/ /g,
				"_"
			)}.pdf`,
			format: "a4",
			printBackground: true,
		});
		console.log(`Succes created akad ${data.name}`);
		await browser.close();
		return result;
	} catch (error) {
		console.log("error", error);
	}
};

try {
	investors.map((data, index) => {
		const documentNumber = `MCINVEST/SPRA-05-${("0" + (index + 1)).slice(-2)}/11/2023`;
		data.documentNumber = documentNumber;
		saveAsPdf(data, index);
	});
} catch (error) {
	console.log("error: ", error);
}
