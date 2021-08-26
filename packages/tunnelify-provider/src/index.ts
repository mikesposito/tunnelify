import {Server, Socket} from 'socket.io';
import express, {Application, NextFunction, Request, Response} from 'express';
import http from 'http';
import https from 'https';
import {CommandLineArgs, TunnelifyCli} from "@mikesposito/tunnelify-cli";
import {ITunnelifyProvider, ITunnelifyTransportableFile} from "./interfaces/tunnelify-provider.interface";
import {input} from "./constants/input";
import {IStorageAccessMode, IStorageAdapter} from "./interfaces/storage.interface";
import {RedisStorageAdapter} from "./storage/redis.storage";

export class TunnelifyProvider implements ITunnelifyProvider {
	app: Application;
	connection: any;
	port: number;
	cli: TunnelifyCli;
	server: http.Server | https.Server;
	rooms: any = {};
	io: any;
	storage: IStorageAdapter;

	constructor(options?: CommandLineArgs) {
		this._bootstrapCli(options);
		if(this.cli.command.storage)
			this._bootstrapStorage(this.cli.command.storage);
		this._bootstrapServer();
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
		if(this.storage)
			this.storage.stop()
	}

	handleConnection(socket: Socket) {
		this._createTunnel(socket).then(tunnel => {
			this._finalizeTunnelCreation(socket, tunnel);
		});
	}

	handleFileRequest(req: Request, res: Response) {
		const { params: { path }, originalUrl, hostname, method } = req;
		const prefix = hostname.split(".")[0];
		this.cli.log(`[${prefix}] ${method} ${originalUrl}`);
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

	private _bootstrapCli(options) {
		this.cli = new TunnelifyCli(options || input, !options);
		if(!this.cli.command.host)
			throw new Error("No host specified. Please choose one with option -h <HOST>");
		this.port = this.cli.command.port || 9410;
		this.cli.log(`Using ${this.cli.command.host} as base url`);
		this.cli.log(`Tunnels will have URLs like: <tunnel_name>.${this.cli.command.host}${[80,443].includes(this.port) ? "" : `:${this.port}`}`);
	}

	private _bootstrapServer() {
		this.app = express();
		this.server = http.createServer(this.app);
		this.io = new Server(this.server);
		this.app.use("/health", this._healthCheck.bind(this));
		this.app.use("/", this.handleFileRequest.bind(this));
		this.app.use("/:path?", this.handleFileRequest.bind(this));
	}

	private _bootstrapStorage(storage: string) {
		switch(storage) {
			case "redis":
				if(!this.cli.command.redisHost || !this.cli.command.redisPort)
					throw new Error("Flag --redisHost and --redisPort needed when using redis storage mode");
				this.storage = new RedisStorageAdapter({
					accessMode: IStorageAccessMode.TCP,
					accessPoint: {
						url: this.cli.command.redisHost
					}
				});
				this.cli.info(`Using Redis as tunnel storage on ${this.cli.command.redisHost}:${this.cli.command.redisPort}`);
				break;
		}
	}

	private async _createTunnel(socket: Socket): Promise<{ name: string, token?: string }> {
		const requestedName: string | string[] = socket.handshake.query.name;
		const providedToken: string | string[] = socket.handshake.query.token;
		if(providedToken && this.storage) {
			const savedTunnel = await this.storage.get(providedToken as string);
			if(savedTunnel) {
				socket.join(savedTunnel);
				this.rooms[savedTunnel] = socket;
				return { name: savedTunnel, token: providedToken as string };
			}
		}
		const name = this._assignName(requestedName ? `${requestedName.toString().toLowerCase()}-` : null);
		socket.join(name);
		let token;
		if(this.storage) {
			token = this._generateRandomName(25).toUpperCase();
			await this.storage.set(token, name);
		}
		this.rooms[name as string] = socket;
		return this.storage ? { name, token } : { name };
	}

	private _finalizeTunnelCreation(socket: Socket, tunnel: { name: string, token?: string }) {
		socket.emit("tunnelified", {
			name: tunnel.name,
			url: `${tunnel.name}.${this.cli.command.host}${[80,443].includes(this.port) ? "" : `:${this.port}`}/`,
			token: tunnel.token
		});
		socket.on("disconnect", () => {
			delete this.rooms[tunnel.name];
			this.cli.info(`Tunnel ${tunnel.name} destroyed. (${Object.keys(this.rooms).length} tunnels now)`);
		});
		this.cli.info(`Tunnel ${tunnel.name} created. (${Object.keys(this.rooms).length} tunnels now)`);
	}

	private _healthCheck(req: Request, res: Response, next: NextFunction) {
		// Check that it's not a tunnel file
		if(!req.hostname.includes("-")) {
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
		const parts = [
			requestedName ? requestedName : this._generateRandomName(length),
			"-",
			this._generateRandomName(length)
		];
		while(this.rooms[parts.reduce((a, v) => a + v, "")]) {
			parts[2] = this._generateRandomName(length);
		}
		return parts.reduce((a, v) => a + v, "");
	}
}