# tunnelify

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mikesposito/tunnelify/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@mikesposito/tunnelify.svg?style=flat)](https://www.npmjs.com/package/@mikesposito/tunnelify) [![Build Status](https://www.travis-ci.com/mikesposito/tunnelify.svg?branch=master)](https://www.travis-ci.com/mikesposito/tunnelify)

A simple tool that exposes static folders from your local machine to the web

![Concept Image](https://tunnelify.s3.eu-west-1.amazonaws.com/concept.png)

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
  - [Command Line](#with-command-line)
  - [From another application](#from-another-application)
- [Use a Custom Remote Domain](#use-a-custom-remote-domain)
- [Examples](#examples)
- [Contributing](#contributing)

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

### From another application

Tunnelify can also be used from other javascript applications.
You can use the main Tunnelify class to instantiate a tunnel:

```javascript
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
$ tunnelify -r https://my-domain.com
```

## Use a Custom Remote Domain

You can create you own remote Tunnelify Provider to expose files on your private domains.

### 1. Install Tunnelify Provider
```bash
$ npm install -g @mikesposito/tunnelify-provider
```

### 2. Run Tunnelify Provider
```bash
$ tunnelify-provider -h <HOSTNAME>
```
Where `<HOSTNAME>` should be your domain.
#### Example:
```bash
$ tunnelify-provider -h my-domain.com
```

By default, tunnelify-provider will listen on port `9410`, but you can shoose a different port with `-p`:
```bash
$ tunnelify-provider -h my-domain.com -p 8080
```

## Contributing

Every contribute is well accepted and the main goal of the project is to provide a solid software.

PRs are welcome and we are writing down some guidelines and code of conducts along with core code and documentation.

#### We hope to provode a comphensive documentation as we go through a version `~v1.0.0`
