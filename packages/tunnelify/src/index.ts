#!/usr/bin/env node
import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import { TunnelifyLocalServer } from "@mikesposito/tunnelify-local-server";
import io from 'socket.io-client';
import { input } from './constants/input';
import path from 'path';
import {DEFAULT_REMOTE} from "./constants/remote";

export interface ITunnelify {
	cli: TunnelifyCli;
	localServer: TunnelifyLocalServer;
	run(): void;
}

export interface ITunnelifyTunnel {
	url: string;
	name: string;
}

export class Tunnelify implements ITunnelify {
	cli: TunnelifyCli;
	localServer: TunnelifyLocalServer;
	io: any;

	constructor() {
		// Init Tunnelify Cli
		this.cli = new TunnelifyCli(input);
		this.cli.log("Created new Tunnelify client");
		// Use default port if not provided
		if(!this.cli.command.port)
			this.cli.command.port = 32000;
		// Init Tunnelify local server
		this._bootstrapLocalServer();
		// Init remote connection
		this._bootstrapTunnel();
	}

	async run() {
		if(this.cli.command.ssl) {
			this.cli.log("SSL Enabled. Generating and trusting new certificates");
			// Tell Tunnelify Local Server to use SSL and generate certificates
			await this.localServer.useSSL(this.cli.command.host);
		}
		this.cli.log("Starting local server");
		this.localServer.listen(this.cli.command.port);
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
		this.io = io(remote, {
			query: {
				name: instanceName
			}
		});
		this.io.on("tunnelified", (tunnel: ITunnelifyTunnel) => this._logTunnelInfo(tunnel));
		this.io.on("file", (method, file, callback) => this.localServer.handleRemoteFileRequest(method, file, callback))
	}

	private _logTunnelInfo(tunnel: ITunnelifyTunnel) {
		this.cli.success(`Tunnel ready`);
		this.cli.success(`HTTP\t\thttp://${tunnel.url}`);
		this.cli.success(`HTTPS\t\thttps://${tunnel.url}`);
	}
}

// Run if called from terminal
if(require.main === module)
	new Tunnelify()
		.run()
		.then(() => {})
		.catch(() => process.exit(1));