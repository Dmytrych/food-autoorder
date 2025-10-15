// Helper function to format date as YYYY-MM-DD string
const formatDate = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// Helper function to check if a date is a weekday (Monday to Friday)
const isWeekday = (date) => {
	const dayOfWeek = date.getDay();
	// getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
	// Weekdays are Monday (1) to Friday (5)
	return dayOfWeek >= 1 && dayOfWeek <= 5;
};

// Helper function to get all dates between start and end date (inclusive)
const getDatesInRange = (startDate, endDate) => {
	const dates = [];
	const currentDate = new Date(startDate);
	const end = new Date(endDate);
	
	// Add one day to end date to make it inclusive
	end.setDate(end.getDate() + 1);
	
	while (currentDate < end) {
		dates.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}
	
	return dates;
};

/**
 * Extracts working days (Monday to Friday) from a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string[]} Array of working days in YYYY-MM-DD format
 */
export const getFormatedWeekdaysRange = (startDate, endDate) => {
	// Validate input format
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
		throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
	}
	
	// Create Date objects
	const start = new Date(startDate);
	const end = new Date(endDate);
	
	// Validate that dates are valid
	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		throw new Error('Invalid date values provided.');
	}
	
	// Validate that start date is not later than end date
	if (start > end) {
		throw new Error('Start date cannot be later than end date.');
	}
	
	// Get all dates in the range
	const allDates = getDatesInRange(start, end);
	
	// Filter to only weekdays and format them
	const weekdays = allDates
		.filter(isWeekday)
		.map(formatDate);
	
	return weekdays;
};
