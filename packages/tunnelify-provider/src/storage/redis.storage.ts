import Redis from 'redis';
import {IStorage, IStorageAdapter} from "../interfaces/storage.interface";

export class RedisStorageAdapter implements IStorageAdapter {
	storage: IStorage;
	private client: any;

	constructor(options: IStorage) {
		this.storage = options;
		this.client = Redis.createClient({
			host: options.accessPoint.url,
			port: options.accessPoint.port
		});
	}

	get(key: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.client.get(key, (err, reply) => {
				if(err)
					reject(err);
				else
					resolve(reply);
			});
		});
	}

	set(key: string, value: any): Promise<void> {
		return new Promise((resolve, reject) => {
			this.client.set(key, value, (err, reply) => {
				if(err)
					reject(err);
				else
					resolve();
			});
		});
	}

	stop() {
		this.client.end(true)
	}
}