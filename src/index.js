import fs from 'fs';
import path from 'path';
import { pickProducts } from './pick-products.js';
import { fetchAllProducts } from './fetch-all-products.js';
import { getLoginCookies, submitOrdered, addToCart, chooseDateAndSubmit } from './api-interactions.js';

const ORDER_DATE = '2025-10-17';
const LOGIN = 'khabaznia-dmytro';
const PASSWORD = '123';

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

const pickProductsAndOrder = async () => {
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
	const dateResponseText = await chooseDateAndSubmit(cookies, ORDER_DATE);

	// Write response texts to HTML files
	// writeResponseToHtml(submitPageText, 'submit-page.html');
	writeResponseToHtml(submitted, 'submitted-response.html');
	writeResponseToHtml(dateResponseText, 'date-response.html');

	// console.log(submitted);
	console.log(dateResponseText);
	//console.log(finalResponseText);

	return products;
}

pickProductsAndOrder();