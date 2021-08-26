import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import { TunnelifyLocalServer, ITunnelifyLocalServer } from "../src";
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { pickPort } from "../../../tests/helpers/suite";

describe("@mikesposito/tunnelify-local-server", () => {
	describe("constructor()", () => {
		it("Should initialize without errors", () => {
			try {
				const cli = new TunnelifyCli({
					src: path.resolve(__dirname, "./__mocks__/test-instance"),
				}, false);
				const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
				expect(localServer).toBeDefined();
			} catch(e) {
				throw e;
			}
		});
	});

	describe("mount()", () => {
		it("Should throw error if path does not exists", async () => {
			return new Promise<void>((resolve, reject) => {
				try {
					const cli = new TunnelifyCli({
						src: path.resolve(__dirname, "./__mocks__/test-instancexxxxx"),
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer.mount(path.resolve(__dirname, "./__mocks__/test-instancexxxxx"));
					fail("Should not have arrived here.");
					reject();
				} catch(e) {
					resolve();
				}
			})
		})
		it("Should mount correct directory without errors", async () => {
			try {
				const cli = new TunnelifyCli({
					src: path.resolve(__dirname, "./__mocks__/test-instance"),
				}, false);
				const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
				localServer.mount(path.resolve(__dirname, "./__mocks__/test-instance"));
				expect(localServer.mountPoint).toBeDefined();
				expect(localServer.mountPoint).toBe(path.resolve(__dirname, "./__mocks__/test-instance"));
			} catch(e) {
				throw e;
			}
		});
	});

	describe("listen()", () => {
		it("Should listen without errors", async () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const mountPath = path.resolve(__dirname, "./__mocks__/test-instance");
					const mountPort = await pickPort(20000, 31999);
					const cli = new TunnelifyCli({
						src: mountPath,
						silent: false,
						verbose: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					let listeningServerReturn = await localServer
						.mount(mountPath)
						.listen(mountPort);
					expect(listeningServerReturn.connection).toBeDefined();
					listeningServerReturn.stop();
					resolve();
				} catch(e) {
					reject(e);
				}
			})
		});
		it("Should serve file correctly", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const mountPath = path.resolve(__dirname, "./__mocks__/test-instance");
					const mountPort = await pickPort(20000, 31999);
					const cli = new TunnelifyCli({
						src: mountPath,
						silent: false,
						verbose: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer
						.mount(mountPath)
						.listen(mountPort)
						.then(listeningServer => {
							request(`http://localhost:${mountPort}/`)
								.get("file.txt")
								.then(response => {
									listeningServer.stop();
									expect(response.status).toBe(200);
									expect(response.text).toBe("Hello, World!");
									resolve();
								})
								.catch(e => reject(e));
						});
				} catch(e) {
					reject(e);
				}
			});
		});
	});

	describe("handleRemoteFileRequest()", () => {
		it("Should handle Remote File Request", async () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const mountPath = path.resolve(__dirname, "./__mocks__/test-instance");
					const mountPort = await pickPort(20000, 31999);
					const cli = new TunnelifyCli({
						src: mountPath,
						silent: false,
						verbose: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer
						.mount(mountPath)
						.listen(mountPort)
						.then(listeningServer => {
							listeningServer.handleRemoteFileRequest("GET", "/file.txt", (response) => {
								listeningServer.stop();
								expect(response).toHaveProperty("file");
								expect(response).toHaveProperty("type");
								expect((response.file as Buffer).toString()).toBe(fs.readFileSync(mountPath + "/file.txt", { encoding: "utf-8" }));
								resolve();
							})
						});
				} catch(e) {
					reject(e);
				}
			});
		})
		it("Should return 404 if file does not exists", async () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const mountPath = path.resolve(__dirname, "./__mocks__/test-instance");
					const mountPort = await pickPort(20000, 31999);
					const cli = new TunnelifyCli({
						src: mountPath,
						silent: false,
						verbose: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer
						.mount(mountPath)
						.listen(mountPort)
						.then(listeningServer => {
							listeningServer.handleRemoteFileRequest("GET", "/file1.txt", (response) => {
								listeningServer.stop();
								expect(response).toHaveProperty("error");
								expect(response.error).toBe(404);
								resolve();
							});
						});
				} catch(e) {
					reject(e);
				}
			});
		})
	});
});