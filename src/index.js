import fs from 'fs';
import path from 'path';
import { pickProducts } from './pick-products.js';
import { fetchAllProducts } from './fetch-all-products.js';
import { getLoginCookies, submitOrdered, addToCart, chooseDateAndSubmit } from './api-interactions.js';
import { getDateRange } from './console-interactions.js';
import { getFormatedWeekdaysRange } from './date-utils.js';


// --------------------  CONFIG  ------------------------
const LOGIN = 'YOUR_LOGIN';
const PASSWORD = 'YOUR_PASSWORD';
// --------------------  END OF CONFIG  ------------------------


const writeResponseToHtml = (responseText, filename) => {
	const outputDir = 'output';
	
	// Create output directory if it doesn't exist
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	
	const filePath = path.join(outputDir, filename);
	fs.writeFileSync(filePath, responseText, 'utf8');
	console.log(`Response written to: ${filePath}`);
};

const loadProductsData = async () => {
		if (fs.existsSync('products.json')) {
			const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
			if (products.validUntil && new Date(products.validUntil) > new Date()) {
				return products;
			}
		}
		console.log("Fetching products data from API");
    const products = await fetchAllProducts(LOGIN, PASSWORD);
		const validUntil = new Date();
		validUntil.setDate(validUntil.getDate() + 7);
		fs.writeFileSync('products.json', JSON.stringify({ ...products, validUntil }, null, 2));
		return products;
}

const pickProductsAndOrder = async (orderDate) => {
	const products = await loadProductsData().catch(error => {
		console.error("Error loading products data", error);
		throw error;
	});

	if (!products) {
		throw new Error("Failed to load products data");
	}

	const pickedProducts = pickProducts(products);

	console.log("Your pick for today:");
	pickedProducts.forEach(product => {
		console.log(product.name);
	});

	const cookies = await getLoginCookies(LOGIN, PASSWORD);
	await Promise.all(pickedProducts.map(async (product) => {
		await addToCart(cookies, product.href);
	}));
	// const submitPageText = await getSubmitPage(cookies);
	const submitted = await submitOrdered(cookies, pickedProducts.map(product => product.pid));
	const dateResponseText = await chooseDateAndSubmit(cookies, orderDate);

	// Write response texts to HTML files
	// writeResponseToHtml(submitPageText, 'submit-page.html');
	writeResponseToHtml(submitted, 'submitted-response.html');
	writeResponseToHtml(dateResponseText, 'date-response.html');

	// console.log(submitted);
	console.log(dateResponseText);
	//console.log(finalResponseText);

	return products;
}

(async () => {
	const dates = await getDateRange()
	const weekdays = getFormatedWeekdaysRange(dates.startDate, dates.endDate);
	console.log(weekdays);
	weekdays.map(async (weekday) => {
		await pickProductsAndOrder(weekday);
	});
})();