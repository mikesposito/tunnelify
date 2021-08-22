import { TunnelifyCli } from "@mikesposito/tunnelify-cli/dist";
import { input as tunnelifyProviderCliInputs } from "@mikesposito/tunnelify-provider/dist/constants/input";
import { TunnelifyLocalServer } from "@mikesposito/tunnelify-local-server/dist";
import { Tunnelify } from "@mikesposito/tunnelify/dist";
import path from "path";

describe("Command line run", () => {
	it("Should call constructors correctly", (done) => {
		const tunnelifyCli = new TunnelifyCli(tunnelifyProviderCliInputs);
		const tunnelifyLocalServer = new TunnelifyLocalServer(tunnelifyCli);
		const tunnelifyInstance = new Tunnelify({
			src: path.resolve(__dirname, "../__mocks__/local-server"),
			flags: {
				silent: true
			}
		});
		done();
	});
});