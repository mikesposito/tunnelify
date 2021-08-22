# Contributing

We are open to, and grateful for, any contributions made by the community. By contributing to axios, you agree to abide by the [code of conduct](https://github.com/axios/axios/blob/master/CODE_OF_CONDUCT.md).

### Code Style

Please follow the [node style guide](https://github.com/felixge/node-style-guide).

### Commit Messages

Commit messages should be verb based, using the following pattern:

type(scope): Short description...

**type** can be one of feat, fix, tests, chore, docs etc..

**scope** should immediately indicate the file, component or package involved in the commit (more detailed is better)

### Testing

Please update the tests to reflect your code changes. Pull requests will not be accepted if they are failing on [Travis CI](https://travis-ci.com/mikesposito/tunnelify).

### Documentation

Please update the [docs](README.md) accordingly so that there are no discrepancies between the API and the documentation.

### Developing

- `yarn test` run the jest tests
- `yarn build` run lerna bootstrap and bundle source with tsc

Please don't include changes to `dist/` in your pull request.

### Releasing

Releasing a new version is mostly automated. For now the [CHANGELOG](https://github.com/mikesposito/tunnelify/blob/master/CHANGELOG.md) requires being updated manually. Once this has been done run the commands below. Versions should follow [semantic versioning](http://semver.org/).

- `lerna publish`
