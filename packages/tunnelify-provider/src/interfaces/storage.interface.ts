export enum IStorageAccessMode {
	TCP = "tcp"
}

export interface IStorageAccessPoint {
	url?: string,
	port?: number,
	path?: string
}

export interface IStorageCredentials {
	username?: string,
	password?: string,
	email?: string
}

export interface IStorage {
	accessMode: IStorageAccessMode,
	accessPoint: IStorageAccessPoint,
	credentials?: IStorageCredentials
}

export interface IStorageAdapter {
	storage: IStorage,
	get(key: string): Promise<string>,
	set(key: string, value: any): Promise<void>
	stop(): void
}