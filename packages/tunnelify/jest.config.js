module.exports = {
	preset: 'ts-jest',
	moduleNameMapper: {
		"@mikesposito/(.+)": "<rootDir>../$1/src"
	}
};