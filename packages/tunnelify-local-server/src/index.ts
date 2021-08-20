import express, { Application } from 'express';
import * as http from "http";
import * as https from "https";
import request from 'supertest';
import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import { generateSSLCertificates } from "./helpers/generateCertificates";
import {binaryParser} from "./helpers/binaryParser";

export type SSLCertificate = {
	cert: string;
	key: string;
};

export interface ITunnelifyLocalServer {
	app: Application,
	mountPoint: string,
	mount(path: string): TunnelifyLocalServer,
	listen(port: number): TunnelifyLocalServer,
	useSSL(host: string): Promise<TunnelifyLocalServer>,
	handleRemoteFileRequest(method: string, file: string, callback: any): void;
}

export class TunnelifyLocalServer implements ITunnelifyLocalServer {
	app: Application;
	server: https.Server | http.Server;
	ssl: SSLCertificate;
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
		if(this.cli.command.verbose)
			this.app.use("/*", (req, res, next) => {
				this.cli.info(`${req.method} ${req.originalUrl}`);
				next();
			});
		this.app.use(express.static(this.mountPoint));
		return this;
	}

	async useSSL(host: string): Promise<TunnelifyLocalServer> {
		try {
			this.ssl = await generateSSLCertificates(host);
		} catch(e) {
			this.cli.error("Error generating SSL certificates. Switching to HTTP.");
			this.cli.error(e);
			this.httpFallback = true;
			return this;
		}
		return this;
	}

	listen(port: number): TunnelifyLocalServer {
		if(this.ssl && !this.httpFallback)
			this.server = https.createServer(
				this.ssl,
				this.app
			);
		else
			this.server = http.createServer();
		this.app.listen(port, () => {
			this.cli.success(`Serving path ${this.mountPoint}`);
		});
		return this;
	}

	async handleRemoteFileRequest(method: string, file: string, callback: any) {
		try {
			this.cli.info(`${method} ${file}`);
			request(this.app)[method.toLowerCase()](file)
				.buffer()
				.parse(binaryParser)
				.end((err, res) => {
					if(!err) {
						callback({
							file: res.body,
							type: res.headers["content-type"]
						});
					} else
						callback({ error: 404 });
				})
		} catch(e) {
			this.cli.error(e);
			callback({ error: e });
		}
	}
}

export { generateSSLCertificates };