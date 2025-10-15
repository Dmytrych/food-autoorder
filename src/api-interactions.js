import qs from 'qs';
import { parse } from 'cookie';
import https from "https";

export const fetchHtml = async (login, password) => {
	const cookies = await getLoginCookies(login, password);
	const html = await getHtml(cookies);
	return html;
}

export const addToCart = async (cookies, productUrlPath) => {
	const response = await fetch(`https://orders.gudfood.com.ua${productUrlPath}`, {
		method: 'GET',
		redirect: 'manual',
		headers: {
			'Host': 'orders.gudfood.com.ua',
			'Accept': '*/*',
			'Accept-Encoding': 'gzip, deflate, br',
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
			'Connection': 'keep-alive',
			'Origin': 'https://orders.gudfood.com.ua',
			'Cookie': formatCookiesToString(cookies),
		},
	});

	return response.text();
}

export const submitOrdered = async (cookies, pids) => {
	const query = new URLSearchParams();
	query.set('pass', 1);
	pids.forEach((pid) => {
		query.set(`qty[${pid}]`, '1');
	});
	query.set('button', 'process');

	console.log(formatCookiesToString(cookies));
	const response = await fetch("https://orders.gudfood.com.ua/order/checkout", {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "max-age=0",
			"content-type": "application/x-www-form-urlencoded",
			"sec-ch-ua": "\"Not=A?Brand\";v=\"24\", \"Chromium\";v=\"140\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"macOS\"",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": formatCookiesToString(cookies),
			"Referer": "https://orders.gudfood.com.ua/order/checkout"
		},
		"body": query.toString(),
		"method": "POST"
	});
	// const response = await fetch(finalUrl, {
	// 	method: 'POST',
	// 	// body: {
	// 	// 	...submitOrders.formData,
	// 	// 	...pids.map(pid => ({
	// 	// 		[`qty[${pid}]`]: '1',
	// 	// 	})),
	// 	// },
	// 	agent: new https.Agent({ keepAlive: true, maxVersion: "TLSv1.3" }),
	// 	headers: {
	// 		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
	// 		'Accept-Encoding': 'gzip, deflate, br, zstd',
	// 		'Accept-Language': 'en-US,en;q=0.9',
	// 		'Cache-Control': 'max-age=0',
	// 		'Content-Type': 'application/x-www-form-urlencoded',
	// 		'Cookie': formatCookiesToString(cookies),
	// 		'DNT': '1',
	// 		'Host': 'orders.gudfood.com.ua',
	// 		'Origin': 'https://orders.gudfood.com.ua',
	// 		'Referer': 'https://orders.gudfood.com.ua/order/checkout',
	// 		'Sec-Fetch-Dest': 'document',
	// 		'Sec-Fetch-Mode': 'navigate',
	// 		'Sec-Fetch-Site': 'same-origin',
	// 		'Sec-Fetch-User': '?1',
	// 		'Upgrade-Insecure-Requests': 1,
	// 		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
	// 		'sec-ch-ua': 'Not=A?Brand";v="24", "Chromium";v="140"',
	// 		'sec-ch-ua-mobile': '?0',
	// 		'sec-ch-ua-platform': 'macOS',
	// 	},
	// });
	console.log(response);

	return response.text();
}

export const chooseDateAndSubmit = async (cookies, dateString) => {
	const query = new URLSearchParams();
	query.set('yt0', 'Завершити замовлення');
	query.set('order_date', dateString);

	const response = await fetch('https://orders.gudfood.com.ua/order/process', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': '*/*',
			'Accept-Encoding': 'gzip, deflate, br',
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
			'Connection': 'keep-alive',
			'Cookie': formatCookiesToString(cookies),
		},
		body: query.toString(),
	});

	return response.text();
}

export const getLoginCookies = async (login, password) => {
	try {
		const data = qs.stringify({
      'form[login]': login,
      'form[password]': password,
    });
		
		const response = await fetch('https://orders.gudfood.com.ua/auth/login', {
			method: 'POST',
			redirect: 'manual',
			body: data,
			headers: {
				'Host': 'orders.gudfood.com.ua',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'en-US,en;q=0.9',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
				'Connection': 'keep-alive',
				'Origin': 'https://orders.gudfood.com.ua',
			},
		});
		const headers = new Headers(response.headers);

		const setCookieHeaders = headers.getSetCookie() ?? [];
		
		// Parse cookies using cookie library
		const parsedCookies = setCookieHeaders.map(cookie => parse(cookie));
		
		// Console log the cookies
		console.log('Parsed cookies:', parsedCookies);

		return parsedCookies;
	} catch (error) {
		console.error('Error getting login cookies:', error.message);
		throw error;
	}
}

const formatCookiesToString = (cookies) => {
	const sid = cookies[0].SID;
	const cookieData = Object.entries(cookies[1])[0];
	// const cookieData = Object.entries(cookies[1]).map(([key, value]) => `${key}=${value}`);
	return `SID=${sid}; ${cookieData[0]}=${encodeURIComponent(cookieData[1])}`;
	// return cookies.map(cookie => {
	// 	// Extract just the cookie name=value pairs, ignoring attributes
	// 	const cookieEntries = Object.entries(cookie);
	// 	return cookieEntries
	// 		.filter(([key, value]) => {
	// 			// Only include actual cookie values, not attributes like 'expires', 'path', etc.
	// 			return key !== 'expires' && key !== 'path' && key !== 'domain' && key !== 'Max-Age' && key !== 'HttpOnly' && key !== 'Secure';
	// 		})
	// 		.map(([key, value]) => {
	// 			// Ensure the value is a string and doesn't contain non-ASCII characters
	// 			const cleanValue = String(value).replace(/[^\x00-\x7F]/g, '');
	// 			return `${key}=${cleanValue}`;
	// 		})
	// 		.join('; ');
	// }).join(';');
}

export const getHtml = async (cookies) => {
	try {
		const cookieString = formatCookiesToString(cookies);

		console.log('Cookie string for request:', cookieString);

		const response = await fetch('https://orders.gudfood.com.ua/order', {
			method: 'GET',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'en-US,en;q=0.9',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
				'Connection': 'keep-alive',
				'Cookie': cookieString,
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
}