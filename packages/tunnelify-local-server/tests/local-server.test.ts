import { TunnelifyCli } from "@mikesposito/tunnelify-cli";
import { TunnelifyLocalServer, ITunnelifyLocalServer } from "../src";
import path from 'path';
import fs from 'fs';
import request from 'supertest';
import {pickPort} from "../../../tests/helpers/suite";

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
						verbose: false,
						silent: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer.mount(mountPath);
					await localServer.listen(mountPort);
					expect(localServer.connection).toBeDefined();
					localServer.stop();
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
						verbose: false,
						silent: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer.mount(mountPath);
					await localServer.listen(mountPort);
					request(`http://localhost:${mountPort}/`)
						.get("file.txt")
						.then(response => {
							localServer.stop();
							expect(response.status).toBe(200);
							expect(response.text).toBe("Hello, World!");
							resolve();
						})
						.catch(e => reject(e));
				} catch(e) {
					reject(e);
				}
			});
		});
	});

	describe("handleRemoteFileRequest()", () => {
		it("Should handle Remote File Request", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const mountPath = path.resolve(__dirname, "./__mocks__/test-instance");
					const mountPort = await pickPort(20000, 31999);
					const cli = new TunnelifyCli({
						src: mountPath,
						verbose: false,
						silent: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer.mount(mountPath);
					await localServer.listen(mountPort);
					localServer.handleRemoteFileRequest("GET", "/file.txt", (response) => {
						localServer.stop();
						expect(response).toHaveProperty("file");
						expect(response).toHaveProperty("type");
						expect((response.file as Buffer).toString()).toBe(fs.readFileSync(mountPath + "/file.txt", { encoding: "utf-8" }));
						resolve();
					})
				} catch(e) {
					reject(e);
				}
			});
		})
		it("Should return 404 if file does not exists", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const mountPath = path.resolve(__dirname, "./__mocks__/test-instance");
					const mountPort = await pickPort(20000, 31999);
					const cli = new TunnelifyCli({
						src: mountPath,
						verbose: false,
						silent: true
					}, false);
					const localServer: ITunnelifyLocalServer = new TunnelifyLocalServer(cli);
					localServer.mount(mountPath);
					await localServer.listen(mountPort);
					localServer.handleRemoteFileRequest("GET", "/file1.txt", (response) => {
						localServer.stop();
						expect(response).toHaveProperty("error");
						expect(response.error).toBe(404);
						resolve();
					})
				} catch(e) {
					reject(e);
				}
			});
		})
	});
});