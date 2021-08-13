#!/usr/bin/env node
import CommandLineArgs from 'command-line-args';
import path from 'path';
import express, {Application} from 'express';

// Parse options
const optionDefinitions = [
	{ name: 'port', alias: 'p', type: Number, multiple: false, defaultOption: 32000 },
	{ name: 'ssl', alias: 's', type: Boolean },
]
const options = CommandLineArgs(optionDefinitions, { stopAtFirstUnknown: true })
const argv = options._unknown || []

// Parse path to expose
const mainCommandOptions = [
	{ name: "command", defaultOption: true }
];
const mainCommand = CommandLineArgs(mainCommandOptions, { argv, stopAtFirstUnknown: true });

// Use default port if not provided
if(!options.port)
	options.port = 32000;

// Log something
console.log(`Running on local on address: http://localhost${options.port == 80 ? "" : `:${options.port}`}`);
if(options.ssl)
	console.log(`SSL ENABLED`)

const app: Application = express();
app.use(express.static(path.resolve(mainCommand.command)));

app.listen(options.port, () => {
	console.log(">", `Serving path ${path.resolve(mainCommand.command)}`);
});