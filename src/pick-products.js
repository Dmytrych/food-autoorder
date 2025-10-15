export const pickProducts = (products) => {
	const categories = getRandomCategories();
	const allCategories = ['mainDish', 'desserts', ...categories];
	const resultingProducts = [];

	allCategories.forEach(category => {
		const productsList = products[category];
		resultingProducts.push(pickRandomProduct(productsList));
	});

	return resultingProducts;
}

const pickRandomProduct = (productsList) => {
	const randomIndex = Math.floor(Math.random() * productsList.length);
	return productsList[randomIndex];
}

const RANDOM_CATEGORIES = [
	'salads',
	'sandwitches',
	'soups',
]

const getRandomCategories = () => {
	return pickRandomItemsFromArray(RANDOM_CATEGORIES, 2);
}

const pickRandomItemsFromArray = (array, itemCount) => {
	if (array.length < itemCount) {
		throw new Error(`Array has only ${array.length} items, but ${itemCount} items were requested`);
	}
	
	const shuffled = [...array].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, itemCount);
}