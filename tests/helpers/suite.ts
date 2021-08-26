import { Tunnelify } from "@mikesposito/tunnelify";
import { TunnelifyProvider } from "@mikesposito/tunnelify-provider";
import { CommandLineArgs } from "@mikesposito/tunnelify-cli";
import portastic from 'portastic';

export const DEFAULT_SELF_HOST = "local.127.0.0.1.nip.io";

export enum ITunnelifyTestSuiteComponentsSelector {
	ALL = "all",
	PROVIDER = "provider",
	CLIENT = "client"
}

export interface ITunnelifyTestSuiteOptions {
	components: ITunnelifyTestSuiteComponentsSelector,
	provider?: CommandLineArgs,
	client?: CommandLineArgs
}

export interface ITunnelifyTestSuite {
	components: ITunnelifyTestSuiteComponentsSelector;
	provider: TunnelifyProvider;
	client: Tunnelify;
	run(): Promise<void>;
	stop(): void;
}

export const buildNewSelfTestSuite = async (options: {
	components?: ITunnelifyTestSuiteComponentsSelector,
	mountPath: string,
	protocol?: string,
	selfUrl?: string,
	portStart?: number,
	silent?: boolean,
	verbose?: boolean,
	storage?: string,
	redisHost?: string,
	redisPort?: string
}): Promise<TunnelifyTestSuite> => {
	if(!options.selfUrl)
		options.selfUrl = "local.127.0.0.1.nip.io";
	if(!options.protocol)
		options.protocol = "http";
	if(!options.portStart)
		options.portStart = 30000;
	if(options.silent === null)
		options.silent = true;
	if(options.verbose === null)
		options.verbose = false;
	if(!options.components)
		options.components = ITunnelifyTestSuiteComponentsSelector.ALL;
	return new Promise<TunnelifyTestSuite>(async (resolve, reject) => {
		const testSuite = new TunnelifyTestSuite({
			components: options.components,
			provider: {
				host: options.selfUrl,
				port: options.portStart,
				silent: options.silent,
				verbose: options.verbose,
				storage: options.storage,
				redisHost: options.redisHost,
				redisPort: options.redisPort
			},
			client: {
				src: options.mountPath,
				remote: `${options.protocol}://${options.selfUrl}:${options.portStart}`,
				port: options.portStart + 1,
				silent: options.silent,
				verbose: options.verbose
			}
		});
		await testSuite.client.run();
		await testSuite.provider.run();
		const awaiter = setInterval(() => {
			// check if there's a tunnel
			if(testSuite.client.tunnel) {
				clearInterval(awaiter);
				resolve(testSuite);
			}
		}, 10);
	})
}

export const buildNewTestProvider = (options = {}): Promise<TunnelifyProvider> => {
	return new Promise(async (resolve, reject) => {
		try {
			const freePort = await pickPort(20000, 31999);
			const provider = new TunnelifyProvider({
				host: DEFAULT_SELF_HOST,
				port: freePort,
				silent: false,
				verbose: true,
				...options
			});
			await provider.run();
			resolve(provider);
		} catch(e) {
			reject(e);
		}
	})
}

export const pickPort = (min, max) => {
	return new Promise<number>((resolve, reject) => {
		const randomlyPicked = Math.floor(Math.random() * (max - min) + min);
		portastic
			.test(Math.floor(randomlyPicked))
			.then(isOpen => resolve(isOpen ? randomlyPicked : pickPort(min, max)))
			.catch(e => reject(e));
	});
}

export class TunnelifyTestSuite implements ITunnelifyTestSuite {
	components: ITunnelifyTestSuiteComponentsSelector;
	options: ITunnelifyTestSuiteOptions;
	client: Tunnelify;
	provider: TunnelifyProvider;

	constructor(options: ITunnelifyTestSuiteOptions) {
		this.options = options;
		this._bootstrapSuite();
	}

	async run() {
		if(this.client)
			await this.client.run();
		if(this.provider)
			await this.provider.run();
	}

	async stop() {
		if(this.client)
			this.client.stop();
		if(this.provider)
			this.provider.stop();
	}

	private _bootstrapSuite() {
		const { ALL, PROVIDER, CLIENT } = ITunnelifyTestSuiteComponentsSelector;
		if([ALL, PROVIDER].includes(this.options.components)) {
			this._initProvider(this.options.provider);
		}
		if([ALL, CLIENT].includes(this.options.components)) {
			this._initClient(this.options.client);
		}
	}

	private _initProvider(options: CommandLineArgs) {
		this.provider = new TunnelifyProvider({
			...options
		});
	}

	private _initClient(options: CommandLineArgs) {
		this.client = new Tunnelify({
			...options
		})
	}
}