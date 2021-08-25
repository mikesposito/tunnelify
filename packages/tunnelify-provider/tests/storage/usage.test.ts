import { redis, storage } from "../__mocks__/redis.mock";
jest.mock("redis", () => redis);
import { TunnelifyProvider } from "../../src";
import { buildNewTestProvider } from "../../../../tests/helpers/suite";
import {io} from "socket.io-client";

let provider: TunnelifyProvider;

describe("@mikesposito/tunnelify-provider/storage", () => {
	beforeAll(() => {
		return new Promise<void>(async (resolve, reject) => {
			provider = await buildNewTestProvider({
				flags: {
					storage: "redis",
					redisHost: "0.0.0.0",
					redisPort: "0000"
				}
			});
			resolve();
		});
	})

	it("Should return a token on tunnel init", () => {
		return new Promise<void>((resolve, reject) => {
			try {
				let socketConnection = io(
					`http://${provider.cli.command.host}:${provider.cli.command.port}`,
					{
						query: {
							name: "test-instance"
						}
					}
				);
				socketConnection.on("tunnelified", tunnel => {
					expect(tunnel).toHaveProperty("token");
					socketConnection.close();
					resolve();
				});
			} catch(e) {
				reject(e);
			}
		});
	});

	it("Should reuse the same name if providing a token", () => {
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
				socketConnection.on("tunnelified", tunnel => {
					expect(tunnel).toHaveProperty("token");
					socketConnection.close();
					const newSocketConnection = io(
						`http://${provider.cli.command.host}:${provider.cli.command.port}`,
						{
							query: {
								name: "test-instance",
								token: tunnel.token
							}
						}
					)
					newSocketConnection.on("tunnelified", (newTunnel) => {
						expect(newTunnel.name).toBe(tunnel.name);
						expect(newTunnel.token).toBe(tunnel.token);
						newSocketConnection.close();
						resolve();
					})
				});
			} catch(e) {
				reject(e);
			}
		});
	});

	afterAll((done) => {
		provider.stop();
		done();
	});
});