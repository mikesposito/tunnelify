import {CommandLineArgs, TunnelifyCli} from "@mikesposito/tunnelify-cli";
import { TunnelifyLocalServer } from "@mikesposito/tunnelify-local-server";
import io from 'socket.io-client';
import { input } from './constants/input';
import path from 'path';
import {DEFAULT_REMOTE} from "./constants/remote";

export interface ITunnelify {
	cli: TunnelifyCli;
	tunnel: ITunnelifyTunnel;
	localServer: TunnelifyLocalServer;
	run(): void;
	restartTunnel(): void;
}

export interface ITunnelifyTunnel {
	url: string;
	name: string;
	token?: string;
}

export class Tunnelify implements ITunnelify {
	cli: TunnelifyCli;
	tunnel: ITunnelifyTunnel;
	localServer: TunnelifyLocalServer;
	io: any;

	constructor(options?: CommandLineArgs) {
		// Init Tunnelify Cli
		this.cli = new TunnelifyCli(options || input, !options);
		this.cli.log("Created new Tunnelify client");
		// Use default port if not provided
		if(!this.cli.command.port)
			this.cli.command.port = 32000;
		// Init Tunnelify local server
		this._bootstrapLocalServer();
	}

	async run() {
		this.cli.log("Starting local server");
		await this.localServer.listen(this.cli.command.port);
		// Init remote connection
		this._bootstrapTunnel();
	}

	restartTunnel() {
		this.io.disconnect();
		this.io.destroy();
		this.tunnel = null;
		this._bootstrapTunnel();
	}

	stop() {
		this.localServer.stop();
		this.io.disconnect();
		this.io.destroy();
	}

	private _bootstrapLocalServer() {
		this.cli.log(`Bootstrapping on local on address: ${this.cli.command.ssl ? "https" : "http"}://${this.cli.command.host || "localhost"}${this.cli.command.port == 80 ? "" : `:${this.cli.command.port}`}`);
		this.localServer = new TunnelifyLocalServer(this.cli)
			.mount(path.resolve(this.cli.command.src))
	}

	private _bootstrapTunnel() {
		const remote = this.cli.command.remote || DEFAULT_REMOTE;
		const instanceName = this.cli.command.name ? this.cli.command.name : this.cli.command.src.split("/")[this.cli.command.src.split("/").length - 1];
		this.cli.log(`Tunneling through ${remote}`);
		const token = this._getEventuallyExistingTunnelToken();
		this.io = io(remote, {
			query: {
				name: instanceName,
				token
			}
		});
		this.io.on("tunnelified", (tunnel: ITunnelifyTunnel) => this._logTunnelInfo(tunnel));
		this.io.on("file", (method, file, callback) => this.localServer.handleRemoteFileRequest(method, file, callback))
	}

	private _logTunnelInfo(tunnel: ITunnelifyTunnel) {
		this.tunnel = tunnel;
		if(tunnel.token)
			this._saveTunnelToken(tunnel.token);
		this.cli.success(`Tunnel ready`);
		this.cli.success(`HTTP\t\thttp://${tunnel.url}`);
		this.cli.success(`HTTPS\t\thttps://${tunnel.url}`);
	}

	private _getEventuallyExistingTunnelToken(): string {
		return this.cli.load(`tunnel:${this.cli.command.src}`);
	}

	private _saveTunnelToken(token: string) {
		this.cli.save(`tunnel:${this.cli.command.src}`, token);
	}
}