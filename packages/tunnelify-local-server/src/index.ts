import express, {Application} from 'express';
import path from "path";

interface ITunnelifyLocalServer {
	app: Application,
	mountPoint: string,
	mount(path: string): TunnelifyLocalServer
	listen(port: number): TunnelifyLocalServer
}

export class TunnelifyLocalServer implements ITunnelifyLocalServer {
	app: Application;
	mountPoint: string;

	constructor() {
		this.app = express();
		return this;
	}

	mount(path: string): TunnelifyLocalServer {
		this.mountPoint = path;
		this.app.use(express.static(this.mountPoint));
		return this;
	}

	listen(port: number): TunnelifyLocalServer {
		this.app.listen(port, () => {
			console.log(">", `Serving path ${this.mountPoint}`);
		});
		return this;
	}
}