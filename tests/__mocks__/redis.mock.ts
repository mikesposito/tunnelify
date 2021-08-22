let storage = {};

const client = {
	end: () => {},
	get: (key, callback) => {
		callback(false, storage[key]);
	},
	set: (key, value, callback) => {
		storage[key] = value;
		callback(false, value)
	}
}

export const redis = {
	createClient: (options: { host: string, port: number }) => {
		return client
	}
}