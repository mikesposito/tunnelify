import { redis } from "../../__mocks__/redis.mock";
jest.mock("redis", () => redis);

import { TunnelifyTestSuite, ITunnelifyTestSuiteComponentsSelector, buildNewSelfTestSuite } from "../../helpers/suite";
import path from 'path';

describe("Use of storage", () => {
	let testSuite: TunnelifyTestSuite;
	beforeAll(async () => {
		return new Promise<void>(async (resolve, reject) => {
			testSuite = await buildNewSelfTestSuite({
				mountPath: path.resolve(__dirname, "../../__mocks__/local-server"),
				portStart: 33333,
				silent: true,
				verbose: false,
				storage: "redis",
				redisHost: "127.0.0.1",
				redisPort: "6379"
			});
			resolve();
		})
	});

	it("Should correctly bootstrap and connect to each other", () => {
		return new Promise<void>((resolve, reject) => {
			try {
				expect(testSuite.client.tunnel).toBeDefined();
				expect(testSuite.client.tunnel.name).toBeDefined();
				expect(testSuite.client.tunnel.url).toBeDefined();
				resolve();
			} catch(e) {
				reject(e);
			}
		});
	});

	it("Provider storage should be defined", () => {
		return new Promise<void>((resolve, reject) => {
			try {
				expect(testSuite.provider.storage).toBeDefined();
				resolve();
			} catch(e) {
				reject(e);
			}
		});
	});

	it("Redis should contain a key relative to tunnel token", () => {
		return new Promise<void>((resolve, reject) => {
			testSuite.provider.storage.get(testSuite.client.tunnel.token)
				.then(value => {
					expect(value).toBe(testSuite.client.tunnel.name);
					resolve();
				})
				.catch((e) => {
					reject(e);
				});
		});
	});

	it("Should stop and restart with the same tunnel name", () => {
		return new Promise<void>((resolve, reject) => {
			const initialName = testSuite.client.tunnel.name;
			testSuite.client.restartTunnel();
			const awaiter = setInterval(() => {
				if(testSuite.client.tunnel) {
					clearInterval(awaiter);
					try {
						expect(testSuite.client.tunnel.name).toBe(initialName);
						resolve();
					} catch(e) {
						reject(e);
					}
				}
			}, 10);
		});
	});

	afterAll((done) => {
		testSuite.provider.stop();
		testSuite.client.stop();
		setTimeout(() => {
			done();
		}, 1000);
	});
});