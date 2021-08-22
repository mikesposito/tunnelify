import { buildNewSelfTestSuite, TunnelifyTestSuite } from "../helpers/suite";
import request from 'supertest';
import path from "path";
import fs from "fs";

describe("Strange directories name handling", () => {
	let testSuite: TunnelifyTestSuite;
	beforeAll(() => {
		return new Promise<void>(async (resolve, reject) => {
			testSuite = await buildNewSelfTestSuite({
				mountPath: path.resolve(__dirname, "../__mocks__/MY_strAngeDiR"),
				portStart: 20411,
				silent: true,
				verbose: false
			});
			resolve();
		});
	});

	it("Should handle CAPS dirs correctly", () => {
		return new Promise<void>(async (resolve, reject) => {
			const tunnelUrl = testSuite.client.tunnel.url;
			request(`http://${tunnelUrl}`)
				.get("file.txt")
				.then(response => {
					const realContent = fs.readFileSync(path.resolve(__dirname, "../__mocks__/MY_strAngeDiR/file.txt"), { encoding: "utf-8" });
					expect(response.status).toBe(200);
					expect(response.text).toBe(realContent);
					resolve();
				})
				.catch(e => reject(e));
		});
	});

	afterAll((done) => {
		testSuite.client.stop();
		testSuite.provider.stop();
		setTimeout(() => {
			done();
		}, 100);
	})
});