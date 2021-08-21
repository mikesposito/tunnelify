#!/usr/bin/env node
import { Tunnelify } from "./index";

(async () => {
	new Tunnelify()
		.run()
		.then(() => {})
		.catch(() => process.exit(1));
})();