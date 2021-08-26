import { redis, storage } from "../__mocks__/redis.mock";
jest.mock("redis", () => redis);
import { TunnelifyProvider } from "../../src";
import { buildNewTestProvider } from "../../../../tests/helpers/suite";

describe("@mikesposito/tunnelify-provider/storage/redis", () => {
	describe("constructor()", () => {
		let provider: TunnelifyProvider;
		beforeAll( () => {
			return new Promise<void>(async (resolve, reject) => {
				provider = await buildNewTestProvider({
					storage: "redis",
					redisHost: "0.0.0.0",
					redisPort: "0000"
				});
				resolve();
			})
		});

		it("Should return error not providing redisHost and redisPort on provider without errors", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					await buildNewTestProvider({
						flags: {
							storage: "redis",
						}
					});
					fail("Should not have arrived here");
					reject();
				} catch(e) {
					resolve();
				}
			})
		});

		it("Should initialize on provider without errors", () => {
			try {
				expect(provider.storage).toBeDefined();
			} catch(e) {
				throw(e);
			}
		});

		afterAll((done) => {
			provider.stop();
			done();
		})
	});

	describe("set()", () => {
		let provider: TunnelifyProvider;
		beforeAll( () => {
			return new Promise<void>(async (resolve, reject) => {
				provider = await buildNewTestProvider({
					storage: "redis",
					redisHost: "0.0.0.0",
					redisPort: "0000"
				});
				resolve();
			})
		});

		it("Should set a value", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					await provider.storage.set("testKey", "testVal");
					expect(storage["testKey"]).toBe("testVal");
					resolve();
				} catch(e) {
					reject(e);
				}
			});
		})

		afterAll((done) => {
			provider.stop();
			done();
		});
	})

	describe("get()", () => {
		let provider: TunnelifyProvider;
		beforeAll( () => {
			return new Promise<void>(async (resolve, reject) => {
				provider = await buildNewTestProvider({
					storage: "redis",
					redisHost: "0.0.0.0",
					redisPort: "0000"
				});
				resolve();
			})
		});

		it("Should get a value", () => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					storage["testKey"] = "testVal";
					const getCall = await provider.storage.get("testKey");
					expect(getCall).toBe("testVal");
					resolve();
				} catch(e) {
					reject(e);
				}
			});
		})

		afterAll((done) => {
			provider.stop();
			done();
		});
	})
})