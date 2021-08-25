# tunnelify

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mikesposito/tunnelify/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@mikesposito/tunnelify.svg?style=flat)](https://www.npmjs.com/package/@mikesposito/tunnelify)
[![npm downloads](https://img.shields.io/npm/dm/@mikesposito/tunnelify.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@mikesposito/tunnelify)
[![Build Status](https://www.travis-ci.com/mikesposito/tunnelify.svg?branch=master)](https://www.travis-ci.com/mikesposito/tunnelify) 
[![codecov](https://codecov.io/gh/mikesposito/tunnelify/branch/master/graph/badge.svg?token=PY666PN5RM)](https://codecov.io/gh/mikesposito/tunnelify)
![CodeQL](https://github.com/mikesposito/tunnelify/actions/workflows/codeql-analysis.yml/badge.svg)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/mikesposito/tunnelify/blob/master/CONTRIBUTING.md)

A simple tool that exposes static folders from your local machine to the web

![Concept Image](https://tunnelify.s3.eu-west-1.amazonaws.com/concept.png)

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
  - [Command Line](#with-command-line)
    - [Expose a folder](#with-command-line)
    - [Custom Port](#custom-port)
    - [Custom Remote Provider](#custom-provider)
  - [From another application](#from-another-application)
- [Use a Custom Remote Domain](#use-a-custom-remote-domain)
  - [Install](#1-install-tunnelify-provider)
  - [Run](#2-run-tunnelify-provider)
    - [Using NPM](#if-installed-with-npm)
    - [Using Docker](#run-with-docker)
  - [Configure DNS](#3-configure-dns)
  - [Configure Redis (Optional)](#4-configure-redis-to-give-permanent-tunnel-names-optional)
- [Examples](#examples)
- [Contributing](#contributing)
  - [Code of conduct](#code-of-conduct)
  - [Contributing Guide](#contributing-guide)
  - [Good First Issues](#good-first-issues)
- [License](#license)

## Features

#### Released

- Expose a local directory to an HTTP port
- Create a remotely accesible url
- Expose your local tunnelify server on the remote url
- Create your custom remote tunnel provider
- Public, Free and Predefined provider `https://tnlfy.live`

#### WIP

- More sophisticated Tunnel management for the Provider
- Better Provider configuration for a more customizable experience


## Install

With npm, for global usage:

```bash
$ npm install -g @mikesposito/tunnelify
```

With npm, for usage in another project:

```bash
$ npm install --save @mikesposito/tunnelify

# OR FOR DEVELOPMENT ONLY:
$ npm install --save-dev @mikesposito/tunnelify
```

## Usage

### With Command Line

Tunnelify only requires an absolute or relative path of the directory containing files you want to expose:

```bash
$ tunnelify <PATH>
```

Tunnelify will expose your path on these addresses:

- http://localhost:32000/
- https://`folder-name`-xxxxx.tnlfy.live/

`xxxxx` will be a random generated string by the remote provider

Instead of `folder-name` you can use a different name using flag `-n` or `--name`:

```bash
$ tunnelify -n <NAME> <PATH>
```

#### Custom Port

You can use `-p <PORT>` to use a custom port number for the local server:

```bash
$ tunnelify -p <PORT> <PATH>
```

#### Custom Provider

You can use `-r <REMOTE_PROVIDER_URL>` to use a different Tunnelify Provider other than the public, free and default `https://tnlfy.live`

```bash
$ tunnelify -r <REMOTE_PROVIDER_URL> <PATH>
```

If you want to use your custom domain when using tunnelify, read section [Use a Custom Remote Domain](#use-a-custom-remote-domain)

### From another application

Tunnelify can also be used from other javascript applications.
You can use the main Tunnelify class to instantiate a tunnel:

```javascript
const { Tunnelify } = require("@mikesposito/tunnelify");

const tunnelify = new Tunnelify({
  src: "/path/to/files",
  flags: {
    remote: `https://tnlfy.live`, 
    port: 32000,
    silent: false | true,
    verbose: false | true
  }
});

tunnelify.run();
```

## Examples

#### Minimal:
```bash
$ tunnelify ./my-folder
```

#### With custom port:
```bash
$ tunnelify -p 3000 ./my-folder
```

#### With custom Tunnelify Provider:
```bash
$ tunnelify -r https://my-domain.com ./my-folder
```

## Use a Custom Remote Domain

You can create you own remote Tunnelify Provider to expose files on your private domains.

### 1. Install Tunnelify Provider

#### With NPM
```bash
$ npm install -g @mikesposito/tunnelify-provider
```

#### With Docker

If you want to use Docker, you can jump to [run with docker step](#run-with-docker)

### 2. Run Tunnelify Provider

#### If installed with NPM
```bash
$ tunnelify-provider -h <HOSTNAME>
```
Where `<HOSTNAME>` should be your domain.

Example:
```bash
$ tunnelify-provider -h my-domain.com
```

By default, tunnelify-provider will listen on port `9410`, but you can choose a different port with `-p`:

```bash
$ tunnelify-provider -h my-domain.com -p 8080
```

#### Run with Docker
```bash
$ docker run -p 9410:9410 --env TUNNELIFY_HOST=my-domain.com mikesposito/tunnelify-provider
```

### 3. Configure DNS
In order to use the dynamic tunnel name resolution on your doman, you will have to add the following DNS "A" records to your domain:

```
A   <your-server-ip>    @
A   <your-server-ip>    *.my-domain.com
```

To use https tunnels, you will have to configure a reverse proxy like NGINX to offload the SSL certificates.
You can find the Helm Chart we use on our Kubernetes cluster for serving https://tnlfy.live

**Note:** The reverse proxy will need a [wildcard certificate](https://en.wikipedia.org/wiki/Wildcard_certificate) to handle the `*.my-domain.com` dynamic resolution

### 4. Configure Redis to give permanent tunnel names (optional)
By default, tunnelify-provider will create a new tunnel name for each new connection, event if the client is the same.
You can optionally configure a Redis server reachable by the provider, to make tunnel names persistent, bound to a token.
To do that, you have to choose `redis` as **storage** option for the tunnelify-provider command:

```bash
$ tunnelify-provider -h my-domain --storage redis --redisHost 127.0.0.1 --redisPort 6379
```

You can use your own host and port values for redis.

**Note:** ATM, `redis` is the only value supported for `--storage`

## Contributing

The main purpose of this repository is to continue evolving tunnelify core, making it faster and easier to use. Development of tunnelify happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving tunnelify.

### [Code of Conduct](CODE_OF_CONDUCT.md)

tunnelify has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

### [Contributing Guide](CONTRIBUTING.md)

Read our [contributing guide](CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to tunnelify.

### Good First Issues

To help you get your feet wet and get you familiar with our contribution process, we have a list of [good first issues](https://github.com/mikesposito/tunnelify/labels/good%20first%20issue) that contain bugs which have a relatively limited scope. This is a great place to get started.

## License

Tunnelify is [MIT licensed](./LICENSE).
