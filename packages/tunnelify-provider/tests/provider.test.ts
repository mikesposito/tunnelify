import { TunnelifyProvider } from "../src";
import request from 'supertest';
import io from 'socket.io-client';
import {buildNewTestProvider} from "../../../tests/helpers/suite";
import fs from 'fs';
import path from 'path';

describe("@mikesposito/tunnelify-provider", () => {
	let provider: TunnelifyProvider;

	describe("constructor()", () => {
		it("Should return error without host", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const brokenProvider = new TunnelifyProvider({});
					await brokenProvider.run();
					fail("Should not have arrived there.");
					reject();
				} catch(e) {
					resolve();
				}
			});
		});

		it("Should setup a Tunnelify Provider", async () => {
			provider = await buildNewTestProvider({
				silent: true
			});
			return new Promise<void>((resolve, reject) => {
				request(`http://${provider.cli.command.host}:${provider.cli.command.port}`)
					.get(`/health`)
					.then(response => {
						expect(response.status).toBe(200);
						resolve();
					})
					.catch((e) => reject(e));
			})
		});
	});

	describe("handleConnection()", () => {
		it("Should correctly create a tunnel", () => {
			return new Promise<void>((resolve, reject) => {
				try {
					const socketConnection = io(
						`http://${provider.cli.command.host}:${provider.cli.command.port}`,
						{
							query: {
								name: "test-instance"
							}
						}
					);
					socketConnection.on("tunnelified", (tunnel: any) => {
						expect(tunnel).toHaveProperty("url");
						expect(tunnel).toHaveProperty("name");
						socketConnection.close();
						resolve();
					})
				} catch(e) {
					reject(e);
				}
			})
		})
	});

	describe("handleFileRequest()", () => {
		let socketConnection;
		let tunnel;
		beforeAll(() => {
			return new Promise<void>(((resolve, reject) => {
				try {
					socketConnection = io(
						`http://${provider.cli.command.host}:${provider.cli.command.port}`,
						{
							query: {
								name: "test-instance"
							}
						}
					);
					socketConnection.on("tunnelified", (_tunnel: any) => {
						tunnel = _tunnel;
						resolve();
					});
					socketConnection.on("file", (method, file, callback) => {
						const filePath = path.resolve(__dirname, `./__mocks__/test-instance${file}`);
						if(!fs.existsSync(filePath))
							callback({
								error: 404
							});
						else
							callback({
								file: fs.readFileSync(filePath),
								type: "text/html"
							});
					});
				} catch(e) {
					reject(e);
				}
			}));
		});

		it("Should return 404 if tunnel does not exists", () => {
			return new Promise<void>(((resolve, reject) => {
				try {
					request(`http://xxx.${provider.cli.command.host}:${provider.cli.command.port}`)
						.get("/file.txt")
						.then(response => {
							expect(response.status).toBe(404);
							resolve();
						})
						.catch(e => reject(e));
				} catch(e) {
					reject(e);
				}
			}));
		});

		it("Should return 404 if file does not exists", () => {
			return new Promise<void>(((resolve, reject) => {
				try {
					request(tunnel.url)
						.get("health")
						.then(response => {
							expect(response.status).toBe(404);
							resolve();
						})
						.catch(e => reject(e));
				} catch(e) {
					reject(e);
				}
			}));
		});

		it("Should serve file correctly", () => {
			return new Promise<void>(((resolve, reject) => {
				try {
					request(tunnel.url)
						.get("file.txt")
						.then(response => {
							expect(response.status).toBe(200);
							expect(response.text).toBe("Hello, World!");
							resolve();
						})
						.catch(e => reject(e));
				} catch(e) {
					reject(e);
				}
			}));
		});

		afterAll(() => {
			socketConnection.close();
		});
	});

	afterAll((done) => {
		provider.stop();
		done();
	});
});