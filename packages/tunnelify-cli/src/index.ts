import CommandLineArgs from 'command-line-args';
import 'colorts/lib/string';

export type CommandLineOption = {
	flags: any[];
	src: any[];
}

export type TunnelifyCliConfiguration = {
	src: string;
	port: number;
	ssl: boolean;
	host: string;
	verbose: string;
	remote: string;
	name: string;
}

export class TunnelifyCli {
	command: TunnelifyCliConfiguration;

	constructor(options: CommandLineOption) {
		const flags = CommandLineArgs(options.flags, { stopAtFirstUnknown: true });
		const argv = flags._unknown || [];
		const main = CommandLineArgs(options.src, { argv, stopAtFirstUnknown: true });
		this.command = { ...flags, ...main };
		return this;
	}

	info(msg) {
		console.log(">".cyan, msg);
	}

	success(msg) {
		console.log(">".green, msg);
	}

	log(msg) {
		console.log(">".grey, msg.grey);
	}

	error(msg) {
		console.log(">".red, msg);
	}
}