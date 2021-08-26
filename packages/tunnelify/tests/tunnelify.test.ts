import { Tunnelify } from "../src";
import path from 'path';

describe("@mikesposito/tunnelify", () => {
	describe("constructor()", () => {
		it("Should init without errors", () => {
			try {
				const tunnelify = new Tunnelify({
					src: path.resolve(__dirname, "./__mocks__/test-instance"),
					silent: false,
					verbose: true
				});
				expect(tunnelify).toBeDefined();
				expect(tunnelify.cli).toBeDefined();
			} catch (e) {
				throw e;
			}
		})
	})

	describe("run()", () => {
		it("Should run without errors", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const tunnelify = new Tunnelify({
						src: path.resolve(__dirname, "./__mocks__/test-instance"),
						silent: false,
						verbose: true
					});
					await tunnelify.run();
					tunnelify.stop();
					resolve();
				} catch (e) {
					throw e;
				}
			})
		})
	});

	describe("restartTunnel()", () => {
		it("Should restart tunnel without errors", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					const tunnelify = new Tunnelify({
						src: path.resolve(__dirname, "./__mocks__/test-instance"),
						silent: false,
						verbose: true
					});
					await tunnelify.run();
					const awaiter = setInterval(() => {
						if(tunnelify.tunnel) {
							tunnelify.restartTunnel();
							tunnelify.stop();
							clearInterval(awaiter);
							resolve();
						}
					}, 10);
				} catch (e) {
					throw e;
				}
			})
		})
	})
});