import { Tunnelify } from "../packages/tunnelify/src";
import { TunnelifyProvider } from "../packages/tunnelify-provider/src";
import { TunnelifyCli } from "../packages/tunnelify-cli/src";
import { TunnelifyLocalServer } from "../packages/tunnelify-local-server/src";
import { input as tunnelifyProviderCliInputs} from "../packages/tunnelify-provider/src/constants/input";
import * as fs from 'fs';
import * as path from 'path';
import request from "supertest";
import axios, { AxiosError } from 'axios';

const REMOTE_SELF_URL = "local.127.0.0.1.nip.io";
const REMOTE_SELF_PORT = 19410;
const SILENT = false;
const VERBOSE_LOG = true;
let app: Tunnelify;
let provider: TunnelifyProvider;
let agent;
const getTunnelUrl = () => `http://${Object.keys(provider.rooms)[0]}.${REMOTE_SELF_URL}:${REMOTE_SELF_PORT}`;

describe("Client & Provider init validations", () => {
	it("Provider should return error if initialized without passing host", () => {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const brokenProvider = new TunnelifyProvider({
					flags: {}
				});
				await brokenProvider.run();
				fail("Should not have arrived there.");
				reject();
			} catch(e) {
				resolve();
			}
		})
	})
});

describe("Command line run", () => {
	it("Should call constructors correctly", (done) => {
		const tunnelifyCli = new TunnelifyCli(tunnelifyProviderCliInputs);
		const tunnelifyLocalServer = new TunnelifyLocalServer(tunnelifyCli);
		const tunnelifyInstance = new Tunnelify({
			src: path.resolve(__dirname, "./__mocks__/local-server"),
			flags: {}
		});
		done();
	});
});


describe("Client & Provider API run", () => {
	beforeAll(() => {
		return new Promise<void>(async (resolve, reject) => {
			const tunnelify = new Tunnelify({
				src: path.resolve(__dirname, "./__mocks__/local-server"),
				flags: {
					remote: `http://${REMOTE_SELF_URL}:${REMOTE_SELF_PORT}`,
					port: 19411,
					silent: SILENT,
					verbose: VERBOSE_LOG
				}
			});

			const tunnelifyProvider = new TunnelifyProvider({
				flags: {
					host: `${REMOTE_SELF_URL}`,
					port: REMOTE_SELF_PORT,
					silent: SILENT
				}
			});

			await tunnelifyProvider.run();
			await tunnelify.run();
			agent = request.agent(tunnelify.localServer.connection);
			app = tunnelify;
			provider = tunnelifyProvider;
			setTimeout(() => {
				// give a second to let client and remote connect
				resolve();
			}, 1000);
		})
	});

	it("Should correctly expose files on local port", () => {
		return new Promise<void>((resolve, reject) => {
			agent.get("/file.txt")
				.then(response => {
					const realContent = fs.readFileSync(path.resolve(__dirname, "./__mocks__/local-server/file.txt"), { encoding: "utf-8" });
					expect(response.text).toBe(realContent);
					resolve();
				})
				.catch(e => reject(e));
		});
	});

	it("Should setup a Tunnelify Provider", (done) => {
		axios.get(`http://${REMOTE_SELF_URL}:${REMOTE_SELF_PORT}/health`)
			.then(response => {
				expect(response.status).toBe(200);
				done(false);
			})
			.catch((e: AxiosError) => {
				done(false);
			});
	});

	it("Tunnelify Provider should return 404 for a wrong file name", () => {
		return new Promise<void>((resolve, reject) => {
			request(getTunnelUrl())
				.get(`/filez.txt`)
				.then(response => {
					expect(response.status).toBe(404);
					resolve();
				})
				.catch(e => {
					reject(e)
				});
		})
	})

	it("Tunnelify Provider should return 404 for a wrong tunnel name", () => {
		return new Promise<void>((resolve, reject) => {
			request(`http://xxx.${REMOTE_SELF_URL}:${REMOTE_SELF_PORT}`)
				.get("/file.txt")
				.then(response => {
					expect(response.status).toBe(404);
					resolve();
				})
				.catch((e) => reject(e));
		});
	})

	it("Tunnelify Provider Should have one open tunnel", () => {
		expect(app.tunnel).toBeDefined();
		expect(app.tunnel.name).toBe(Object.keys(provider.rooms)[0]);
	});

	it("Tunnelify Provider should expose correct files from local server", () => {
		return new Promise<void>((resolve, reject) => {
			request(getTunnelUrl())
				.get("/file.txt")
				.then(response => {
					const realContent = fs.readFileSync(path.resolve(__dirname, "./__mocks__/local-server/file.txt"), { encoding: "utf-8" });
					expect(response.status).toBe(200);
					expect(response.text).toBe(realContent);
					resolve();
				})
				.catch(e => reject(e));
		});
	});

	afterAll((done) => {
		provider.stop();
		app.stop();
		setTimeout(() => {
			done();
		}, 1000);
	})
});