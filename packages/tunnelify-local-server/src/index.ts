import express, { Application } from 'express';
import * as http from "http";
import request from 'supertest';
import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import {binaryParser} from "./helpers/binaryParser";
import fs from 'fs';

export interface ITunnelifyLocalServer {
	app: Application,
	mountPoint: string,
	connection: any,
	agent: any,
	mount(path: string): TunnelifyLocalServer,
	listen(port: number): Promise<TunnelifyLocalServer>,
	stop(): TunnelifyLocalServer,
	handleRemoteFileRequest(method: string, file: string, callback: any): void;
}

export class TunnelifyLocalServer implements ITunnelifyLocalServer {
	app: Application;
	server: http.Server;
	connection: any;
	agent: any;
	httpFallback: boolean = false;
	cli: TunnelifyCli;
	mountPoint: string;

	constructor(cli: TunnelifyCli) {
		this.app = express();
		this.cli = cli;
		return this;
	}

	mount(path: string): TunnelifyLocalServer {
		this.mountPoint = path;
		if(!fs.existsSync(this.mountPoint))
			throw new Error(`Path ${this.mountPoint} does not exists.`);
		if(this.cli.command.verbose)
			this.app.use("/*", (req, res, next) => {
				this.cli.info(`${req.method} ${req.originalUrl}`);
				next();
			});
		this.app.use(express.static(this.mountPoint));
		return this;
	}

	listen(port: number): Promise<TunnelifyLocalServer> {
		return new Promise((resolve, reject) => {
			this.server = http.createServer();
			const connection = this.app.listen(port, () => {
				this.cli.success(`Serving path ${this.mountPoint}`);
				this.connection = connection;
				resolve(this);
			});
		})
	}

	stop(): TunnelifyLocalServer {
		this.server.close();
		this.connection.close();
		return this;
	}

	async handleRemoteFileRequest(method: string, file: string, callback: any) {
		try {
			this.cli.info(`${method} ${file}`);
			request.agent(this.app)[method.toLowerCase()](file)
				.buffer()
				.parse(binaryParser)
				.end((err, res) => {
					if(res.status === 404 || err)
						callback({ error: res.status });
					else
						callback({
							file: res.body,
							type: res.headers["content-type"]
						});
				});
		} catch(e) {
			this.cli.error(e);
			callback({ error: e });
		}
	}
}