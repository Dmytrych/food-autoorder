import readline from 'readline';

// Create readline interface for console input
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Helper function to validate date format (YYYY-MM-DD)
const isValidDateFormat = (dateString) => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(dateString)) {
		return false;
	}
	
	const date = new Date(dateString);
	return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
};

// Helper function to check if date is today, tomorrow, or in the past
const isDateInvalid = (dateString) => {
	const inputDate = new Date(dateString);
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	
	// Reset time to compare only dates
	inputDate.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);
	tomorrow.setHours(0, 0, 0, 0);
	
	return inputDate <= tomorrow;
};

// Helper function to get user input as a promise
const getInput = (question) => {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
};

// Main function to get and validate date range
export const getDateRange = async () => {
	try {
		console.log('Please enter the date range for your food orders:');
		console.log('Format: YYYY-MM-DD (e.g., 2025-10-17)');
		console.log('Note: Dates must be at least 2 days in the future\n');
		
		// Get start date
		const startDateInput = await getInput('Enter start date: ');
		
		// Validate start date format
		if (!isValidDateFormat(startDateInput)) {
			throw new Error(`Invalid start date format: ${startDateInput}. Please use YYYY-MM-DD format.`);
		}
		
		// Check if start date is valid (not today, tomorrow, or in the past)
		if (isDateInvalid(startDateInput)) {
			throw new Error(`Start date ${startDateInput} must be at least 2 days in the future.`);
		}
		
		// Get end date
		const endDateInput = await getInput('Enter end date: ');
		
		// Validate end date format
		if (!isValidDateFormat(endDateInput)) {
			throw new Error(`Invalid end date format: ${endDateInput}. Please use YYYY-MM-DD format.`);
		}
		
		// Check if end date is valid (not today, tomorrow, or in the past)
		if (isDateInvalid(endDateInput)) {
			throw new Error(`End date ${endDateInput} must be at least 2 days in the future.`);
		}
		
		// Convert to Date objects for comparison
		const startDate = new Date(startDateInput);
		const endDate = new Date(endDateInput);
		
		// Check if start date is later than end date
		if (startDate > endDate) {
			throw new Error(`Start date ${startDateInput} cannot be later than end date ${endDateInput}.`);
		}
		
		console.log(`\n✅ Valid date range: ${startDateInput} to ${endDateInput}`);
		
		return {
			startDate: startDateInput,
			endDate: endDateInput
		};
		
	} catch (error) {
		console.error(`\n❌ Error: ${error.message}`);
		throw error;
	} finally {
		rl.close();
	}
};
