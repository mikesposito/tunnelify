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
			name: 'storage',
			type: String
		},
		{
			name: "redisHost",
			type: String
		},
		{
			name: "redisPort",
			type: String
		}
	],
	src: []
}