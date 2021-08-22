import { Application } from "express";
import http from "http";
import https from "https";
import { TunnelifyProvider } from "../index";
import {IStorageAdapter} from "./storage.interface";

export interface ITunnelifyTransportableFile {
	type: string;
	error?: any;
	file: Buffer;
}

export interface ITunnelifyProvider {
	app: Application;
	connection: any;
	port: number;
	server: http.Server | https.Server;
	io: any;
	rooms: any;
	storage: IStorageAdapter;
	run(port: number): Promise<TunnelifyProvider>;
	stop(): void;
}