import express, { Application } from 'express';
import * as http from "http";
import request from 'supertest';
import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import { binaryParser } from "./helpers/binaryParser";
import fs from 'fs';

export interface ITunnelifyLocalServer {
	app: Application,
	mountPoint: string,
	connection: any,
	cli: TunnelifyCli,
	mount(path: string): TunnelifyLocalServer,
	listen(port: number): Promise<TunnelifyLocalServer>,
	stop(): TunnelifyLocalServer,
	handleRemoteFileRequest(method: string, file: string, callback: any): void;
}

export class TunnelifyLocalServer implements ITunnelifyLocalServer {
	app: Application;
	mountPoint: string;
	server: http.Server;
	connection: any;
	cli: TunnelifyCli;

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
			try {
				this.server = http.createServer();
				this.connection = this.app.listen(port, () => {
					this.cli.success(`Serving path ${this.mountPoint}`);
					resolve(this);
				});
			} catch(e) {
				this.cli.error(e);
				reject(e);
			}
		});
	}

	stop(): TunnelifyLocalServer {
		this.connection.close();
		this.server.close();
		return this;
	}

	handleRemoteFileRequest(method: string, file: string, callback: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
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
						resolve();
					});
			} catch(e) {
				this.cli.error(e);
				callback({ error: e });
				reject();
			}
		});
	}
}