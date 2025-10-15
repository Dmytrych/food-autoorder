import * as cheerio from 'cheerio';
import { fetchHtml } from './api-interactions.js';

const categoryMapping = {
	'salati': 'salads',
	'sendvichi': 'sandwitches',
	'supi': 'soups',
	'deserti': 'desserts',
	'osnovna-strava': 'mainDish'
};

export const fetchAllProducts = async (login, password) => {
	const html = await fetchHtml(login, password);
	return parseProductPage(html);
}

export const parseProductPage = (html) => {
	// Parse HTML with cheerio
	const $ = cheerio.load(html);
	
	// Object to store products by category
	const productsByCategory = {};
	
	// Get all category panels
	$('div[role="tabpanel"]').each((categoryIndex, categoryElement) => {
		const $category = $(categoryElement);
		const categoryId = $category.attr('id');
		
		// Skip the "garnir" category as requested
		if (categoryId === 'garnir') {
			return;
		}
		
		// Initialize array for this category
		productsByCategory[categoryId] = [];
		
		// Get all products within this category
		$category.find('.product-row').each((productIndex, productElement) => {
			const $product = $(productElement);
			
			// Extract product name
			const name = $product.find('h4.media-heading').text().trim();
			
			// Extract ingredients from the first <p> element
			const ingredientsText = $product.find('p').first().text().trim();
			const ingredients = ingredientsText ? ingredientsText.split(',').map(ing => ing.trim()).filter(ing => ing) : null;
			
			// Extract nutrition data - look for the pattern with Білки, Жири, etc.
			const mediaBody = $product.find('.media-body').html();
			const nutritionMatch = mediaBody.match(/<b>Білки:<\/b>.*?ккал/);
			const nutrients = nutritionMatch ? nutritionMatch[0] : null;
			
			// Extract href from the "В кошик" button
			const href = $product.find('a.btn.btn-success.buy').attr('href') || null;
			
			// Extract PID from href (format: "/order/buy/pid/4391")
			let pid = null;
			if (href) {
				const pidMatch = href.match(/\/order\/buy\/pid\/(\d+)/);
				if (pidMatch) {
					pid = pidMatch[1];
				} else {
					throw new Error(`Cannot extract PID from href: ${href} for product: ${name}`);
				}
			} else {
				throw new Error(`Product "${name}" has no href attribute`);
			}
			
			// Only add products that have a name
			if (name) {
				productsByCategory[categoryId].push({
					name,
					ingredients,
					nutrients,
					href,
					pid
				});
			}
		});
	});
	
	// Rename categories
	const renamedProductsByCategory = {};
	Object.keys(productsByCategory).forEach(categoryId => {
		const englishName = categoryMapping[categoryId] || categoryId;
		renamedProductsByCategory[englishName] = productsByCategory[categoryId];
	});
	
	// Log summary
	let totalProducts = 0;
	Object.keys(renamedProductsByCategory).forEach(category => {
		const count = renamedProductsByCategory[category].length;
		console.log(`\nCategory "${category}": ${count} products`);
		totalProducts += count;
	});
	console.log(`\nTotal products found: ${totalProducts}`);
	
	return renamedProductsByCategory;
}