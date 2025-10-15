import qs from 'qs';
import { parse } from 'cookie';

// Constants
const BASE_URL = 'https://orders.gudfood.com.ua';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

// Common headers
const getCommonHeaders = (cookies) => ({
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
	'Accept-Encoding': 'gzip, deflate, br',
	'Accept-Language': 'en-US,en;q=0.9',
	'User-Agent': USER_AGENT,
	'Connection': 'keep-alive',
	'Cookie': formatCookiesToString(cookies),
});

// Helper function to format cookies
const formatCookiesToString = (cookies) => {
	const sid = cookies[0].SID;
	const cookieData = Object.entries(cookies[1])[0];
	return `SID=${sid}; ${cookieData[0]}=${encodeURIComponent(cookieData[1])}`;
};

// Exported functions
export const fetchHtml = async (login, password) => {
	const cookies = await getLoginCookies(login, password);
	const html = await getHtml(cookies);
	return html;
};

export const addToCart = async (cookies, productUrlPath) => {
	const response = await fetch(`${BASE_URL}${productUrlPath}`, {
		method: 'GET',
		redirect: 'manual',
		headers: {
			...getCommonHeaders(cookies),
			'Host': 'orders.gudfood.com.ua',
			'Accept': '*/*',
			'Origin': 'https://orders.gudfood.com.ua',
		},
	});

	return response.text();
};

export const submitOrdered = async (cookies, pids) => {
	const query = new URLSearchParams();
	query.set('pass', '1');
	pids.forEach((pid) => {
		query.set(`qty[${pid}]`, '1');
	});
	query.set('button', 'process');

	const response = await fetch(`${BASE_URL}/order/checkout`, {
		method: 'POST',
		headers: {
			...getCommonHeaders(cookies),
			'Content-Type': 'application/x-www-form-urlencoded',
			'Cache-Control': 'max-age=0',
			'Referer': 'https://orders.gudfood.com.ua/order/checkout',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-User': '?1',
			'Upgrade-Insecure-Requests': '1',
		},
		body: query.toString(),
	});

	return response.text();
};

export const chooseDateAndSubmit = async (cookies, dateString) => {
	const query = new URLSearchParams();
	query.set('yt0', 'Завершити замовлення');
	query.set('order_date', dateString);

	const response = await fetch(`${BASE_URL}/order/process`, {
		method: 'POST',
		headers: {
			...getCommonHeaders(cookies),
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': '*/*',
		},
		body: query.toString(),
	});

	return response.text();
};

export const getLoginCookies = async (login, password) => {
	try {
		const data = qs.stringify({
			'form[login]': login,
			'form[password]': password,
		});
		
		const response = await fetch(`${BASE_URL}/auth/login`, {
			method: 'POST',
			redirect: 'manual',
			body: data,
			headers: {
				'Host': 'orders.gudfood.com.ua',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'en-US,en;q=0.9',
				'User-Agent': USER_AGENT,
				'Connection': 'keep-alive',
				'Origin': 'https://orders.gudfood.com.ua',
			},
		});

		const headers = new Headers(response.headers);
		const setCookieHeaders = headers.getSetCookie() ?? [];
		const parsedCookies = setCookieHeaders.map(cookie => parse(cookie));
		
		console.log('Parsed cookies:', parsedCookies);
		return parsedCookies;
	} catch (error) {
		console.error('Error getting login cookies:', error.message);
		throw error;
	}
};

export const getHtml = async (cookies) => {
	try {
		const cookieString = formatCookiesToString(cookies);
		console.log('Cookie string for request:', cookieString);

		const response = await fetch(`${BASE_URL}/order`, {
			method: 'GET',
			headers: {
				...getCommonHeaders(cookies),
				'Referer': 'https://orders.gudfood.com.ua/auth/login'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const html = await response.text();
		console.log('HTML content length:', html.length);
		
		return html;
	} catch (error) {
		console.error('Error fetching HTML:', error.message);
		throw error;
	}
};