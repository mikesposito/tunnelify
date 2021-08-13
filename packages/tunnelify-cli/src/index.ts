import CommandLineArgs from 'command-line-args';

type CommandLineOption = {
	flags: any[];
	src: any[];
}

type TunnelifyCliConfiguration = {
	src: string;
	port: number;
	ssl: boolean;
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
}