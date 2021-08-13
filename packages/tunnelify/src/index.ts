#!/usr/bin/env node
import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import { TunnelifyLocalServer } from "@mikesposito/tunnelify-local-server";
import { input } from './constants/input';
import path from 'path';

export interface ITunnelify {
	cli: TunnelifyCli;
	localServer: TunnelifyLocalServer;
	run(): void;
}

export class Tunnelify implements ITunnelify {
	cli: TunnelifyCli;
	localServer: TunnelifyLocalServer;

	constructor() {
		// Init Tunnelify Cli
		this.cli = new TunnelifyCli(input);
		this.cli.log("Created new Tunnelify client");
		// Use default port if not provided
		if(!this.cli.command.port)
			this.cli.command.port = 32000;
		// Init Tunnelify local server
		this.cli.log(`Bootstrapping on local on address: ${this.cli.command.ssl ? "https" : "http"}://${this.cli.command.host || "localhost"}${this.cli.command.port == 80 ? "" : `:${this.cli.command.port}`}`);
		this.localServer = new TunnelifyLocalServer(this.cli)
			.mount(path.resolve(this.cli.command.src))
	}

	async run() {
		if(this.cli.command.ssl) {
			this.cli.log("SSL Enabled. Generating and trusting new certificates");
			// Tell Tunnelify Local Server to use SSL and generate certificates
			await this.localServer.useSSL(this.cli.command.host);
		}
		this.cli.success("Starting local server");
		this.localServer.listen(this.cli.command.port);
	}
}

// Run if called from terminal
if(require.main === module)
	new Tunnelify()
		.run()
		.then(() => {})
		.catch(() => process.exit(1));