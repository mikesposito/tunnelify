import { TunnelifyProvider } from "@mikesposito/tunnelify-provider/dist";

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