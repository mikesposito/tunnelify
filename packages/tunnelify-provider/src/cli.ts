import { TunnelifyProvider } from "./index";

(async () => {
	new TunnelifyProvider()
		.run()
		.then(() => {})
		.catch(() => process.exit(1));
})();