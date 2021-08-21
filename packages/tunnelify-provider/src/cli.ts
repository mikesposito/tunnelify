#!/usr/bin/env node
import { TunnelifyProvider } from "./index";

(async () => {
	new TunnelifyProvider()
		.run()
		.then(() => {})
		.catch(() => process.exit(1));
})();