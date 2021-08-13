export const input = {
	flags: [
		{ name: 'port', alias: 'p', type: Number, multiple: false, defaultOption: 32000 },
		{ name: 'ssl', alias: 's', type: Boolean },
	],
	src: [
		{ name: "src", defaultOption: true }
	]
}