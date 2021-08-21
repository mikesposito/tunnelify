#!/usr/bin/env node
import { Server, Socket } from 'socket.io';
import express, {Application, NextFunction, Request, Response} from 'express';
import http from 'http';
import https from 'https';
import {CommandLineArgs, TunnelifyCli} from "@mikesposito/tunnelify-cli";
import { input } from "./constants/input";

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
	run(port: number): Promise<TunnelifyProvider>;
	stop(): void;
}

export class TunnelifyProvider implements ITunnelifyProvider {
	app: Application;
	connection: any;
	port: number;
	cli: TunnelifyCli;
	server: http.Server | https.Server;
	rooms: any = {};
	io: any;

	constructor(options?: CommandLineArgs) {
		this.cli = new TunnelifyCli(options || input, !options);
		if(!this.cli.command.host)
			throw new Error("No host specified. Please choose one with option -h <HOST>");
		this.port = this.cli.command.port || 9410;
		this.cli.log(`Using ${this.cli.command.host} as base url`);
		this.cli.log(`Tunnels will have URLs like: <tunnel_name>.${this.cli.command.host}${[80,443].includes(this.port) ? "" : `:${this.port}`}`);
		this.app = express();
		this.server = http.createServer(this.app);
		this.io = new Server(this.server);
		this.app.use("/health", this._healthCheck.bind(this));
		this.app.use("/:path", this.handleFileRequest.bind(this));
	}

	run(): Promise<TunnelifyProvider> {
		return new Promise((resolve, reject) => {
			let connection = this.server.listen(this.port, () => {
				this.cli.success(`Tunnelify Remote Server listening on ${this.cli.command.port || 9410}`);
				this.io.on("connection", this.handleConnection.bind(this));
				this.connection = connection;
				resolve(this);
			});
		})
	}

	stop() {
		this.server.close();
		this.connection.close();
	}

	handleConnection(socket: Socket) {
		const requestedName = socket.handshake.query.name;
		const name = this._assignName(requestedName ? `${requestedName}-` : null);
		this.cli.info(`Tunnel ${name} created.`);
		socket.join(name);
		this.rooms[name as string] = socket;
		socket.emit("tunnelified", {
			name,
			url: `${name}.${this.cli.command.host}${[80,443].includes(this.port) ? "" : `:${this.port}`}/`
		});
	}

	handleFileRequest(req: Request, res: Response) {
		const { params: { path }, originalUrl, hostname, method } = req;
		const prefix = hostname.split(".")[0];
		if(!this.rooms[prefix]) {
			res.status(404).send(`No server found with name "${prefix}".`);
			return;
		} else {
			this.rooms[prefix].emit("file", method, originalUrl, (response: ITunnelifyTransportableFile) => {
				if(response.error)
					res.status(404).end();
				else {
					res.setHeader("Content-Type", response.type);
					res.send(response.file);
				}
			});
		}
	}

	private _healthCheck(req: Request, res: Response, next: NextFunction) {
		// Check that it's not a tunnel file
		if(req.hostname !== this.cli.command.host) {
			res.status(200).send();
			return;
		} else {
			next();
		}
	}

	private _generateRandomName(length: number = 5): string {
		let result           = '';
		const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for ( let i = 0; i < length; i++ ) {
			result += characters.charAt(Math.floor(Math.random() *
				charactersLength));
		}
		return result;
	}

	private _assignName(requestedName, length: number = 5): string {
		let generated = `${requestedName || ""}${this._generateRandomName(length)}`;
		while(this.rooms[generated]) {
			generated = `${requestedName || ""}${this._generateRandomName(length)}`;
		}
		return generated;
	}
}