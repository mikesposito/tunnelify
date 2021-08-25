import CommandLineArgs from 'command-line-args';
import 'colorts/lib/string';
import fs from 'fs';
import path from 'path';
import os from 'os';

export type CommandLineOption = {
	flags: any[];
	src: any[];
}

export type CommandLineArgs = {
	host?: string;
	port?: number;
	verbose?: boolean;
	silent?: boolean;
	remote?: string;
	name?: string;
	storage?: string;
	redisHost?: string;
	redisPort?: string;
	src?: string;
}

export type TunnelifyCliConfiguration = {
	src: string;
	port?: number;
	ssl?: boolean;
	host?: string;
	verbose?: string;
	silent?: boolean;
	remote?: string;
	name?: string;
	storage?: string;
	redisHost?: string;
	redisPort?: string;
}

export interface ITunnelifyCli {
	command: TunnelifyCliConfiguration;
	info(msg: string);
	success(msg: string);
	log(msg: string);
	error(msg: string);
	save(key: string, value: string);
	load(key: string): string;
}

export class TunnelifyCli implements ITunnelifyCli {
	command: TunnelifyCliConfiguration;

	constructor(options: CommandLineOption | CommandLineArgs, cli: boolean = true) {
		if(cli) {
			const flags = CommandLineArgs(options.flags, { stopAtFirstUnknown: true });
			const argv = flags._unknown || [];
			const main = CommandLineArgs(options.src, { argv, stopAtFirstUnknown: true });
			this.command = { ...flags, ...main };
		} else {
			this.command = { ...options };
		}
		return this;
	}

	info(msg) {
		if(!this.command.silent)
			console.log(">".cyan, msg);
	}

	success(msg) {
		if(!this.command.silent)
			console.log(">".green, msg);
	}

	log(msg) {
		if(!this.command.silent)
			console.log(">".grey, msg.grey);
	}

	error(msg) {
		if(!this.command.silent)
			console.log(">".red, msg);
	}

	save(key: string, value: string) {
		if(fs.existsSync(path.resolve(os.homedir(), "./.tunnelify"))) {
			const existing = this.load(key);
			if(existing) {
				const values = fs.readFileSync(path.resolve(os.homedir(), "./.tunnelify"), { encoding: "utf-8" });
				const lines = values.split("\r\n");
				delete lines[lines.indexOf(lines.find(l => l.startsWith(`${key}|`)))];
				fs.rmSync(path.resolve(os.homedir(), "./.tunnelify"));
				const stream = fs.createWriteStream(path.resolve(os.homedir(), "./.tunnelify"), { flags: 'a' });
				for (const line of lines)
					stream.write(`${line}\r\n`);
				stream.write(`${key}|${value}\r\n`);
				stream.close();
				return;
			}
			const stream = fs.createWriteStream(path.resolve(os.homedir(), "./.tunnelify"), { flags: 'a' });
			stream.write(`${key}|${value}\r\n`);
			stream.close();
			return;
		}

		fs.writeFileSync(path.resolve(os.homedir(), "./.tunnelify"), `${key}|${value}\r\n`);
	}

	load(key: string): string {
		if(!fs.existsSync(path.resolve(os.homedir(), "./.tunnelify")))
			return null;
		const values = fs.readFileSync(path.resolve(os.homedir(), "./.tunnelify"), { encoding: "utf-8" });
		const lines = values.split("\r\n");
		const asked = lines.find(l => l.startsWith(`${key}|`));
		if(!asked)
			return null;
		else
			return asked.split("|")[1];
	}
}