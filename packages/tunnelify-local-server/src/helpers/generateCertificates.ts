import fs from "fs";
import path from "path";
import { openssl } from "../constants/openssl";
import { spawn } from "child_process";
import { SSLCertificate } from "../index";

export const generateSSLCertificates = (host): Promise<SSLCertificate> => {
	return new Promise((resolve, reject) => {
		const workingDir = path.resolve(__dirname, "./.ssl");
		if(!fs.existsSync(workingDir))
			fs.mkdirSync(workingDir);
		fs.writeFileSync(path.resolve(__dirname, './.ssl/openssl.cnf'), openssl.replace("__HOSTNAME__", host));
		const opensslConfigPath = path.resolve(__dirname, './.ssl/openssl.cnf');
		const keyPath = path.resolve(__dirname, `./.ssl/${host}.key`);
		const crtPath = path.resolve(__dirname, `./.ssl/${host}.crt`);
		const workerProcess = spawn(`openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -config ${opensslConfigPath} -keyout ${keyPath} -out ${crtPath} -subj \"/C=IT/ST=Lombardy/L=Milan/O=Michele/OU=Michele/CN=${host}\"; security add-trusted-cert -d -r trustRoot -k $(security login-keychain | tr -d '\"') ${crtPath}\n`)
		workerProcess.on("end", () => {
			resolve({
				cert: crtPath,
				key: keyPath
			});
		});
		workerProcess.on("error", () => reject());
	});
}