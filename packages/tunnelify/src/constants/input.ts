import { CommandLineOption } from "@mikesposito/tunnelify-cli";


export const input: CommandLineOption = {
	flags: [
		{
			name: 'port',
			alias: 'p',
			type: Number,
			multiple: false,
			defaultOption: 32000
		},
		{
			name: 'ssl',
			alias: 's',
			type: Boolean
		},
		{
			name: 'host',
			alias: 'h',
			type: String
		},
		{
			name: 'verbose',
			alias: 'v',
			type: Boolean
		},
		{
			name: 'remote',
			alias: 'r',
			type: String
		},
		{
			name: "name",
			alias: "n",
			type: String
		},
		{
			name: "silent",
			alias: "silent",
			type: Boolean,
			defaultOption: false
		}
	],
	src: [
		{
			name: "src",
			defaultOption: true
		}
	]
}