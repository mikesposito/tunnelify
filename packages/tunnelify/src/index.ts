#!/usr/bin/env node
import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import { TunnelifyLocalServer } from "@mikesposito/tunnelify-local-server";
import { input } from './constants/input';
import path from 'path';

// Init Tunnelify Cli
const cli = new TunnelifyCli(input);

// Use default port if not provided
if(!cli.command.port)
	cli.command.port = 32000;

// Log something
console.log(`Running on local on address: http://localhost${cli.command.port == 80 ? "" : `:${cli.command.port}`}`);
if(cli.command.ssl)
	console.log(`SSL ENABLED`)

// Start Tunnelify local server
const localServer = new TunnelifyLocalServer()
	.mount(path.resolve(cli.command.src))
	.listen(cli.command.port);