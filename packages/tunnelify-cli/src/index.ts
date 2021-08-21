import CommandLineArgs from 'command-line-args';
import 'colorts/lib/string';

export type CommandLineOption = {
	flags: any[];
	src: any[];
}

export type CommandLineArgs = {
	flags: {
		host?: string;
		port?: number;
		verbose?: boolean;
		silent?: boolean;
		remote?: string;
		name?: string;
	};
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
}

export class TunnelifyCli {
	command: TunnelifyCliConfiguration;

	constructor(options: CommandLineOption | CommandLineArgs, cli: boolean = true) {
		if(cli) {
			const flags = CommandLineArgs(options.flags, { stopAtFirstUnknown: true });
			const argv = flags._unknown || [];
			const main = CommandLineArgs(options.src, { argv, stopAtFirstUnknown: true });
			this.command = { ...flags, ...main };
		} else {
			this.command = { ...options.flags, src: options.src };
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
}