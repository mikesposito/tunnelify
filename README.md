# tunnelify

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mikesposito/tunnelify/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@mikesposito/tunnelify.svg?style=flat)](https://www.npmjs.com/package/@mikesposito/tunnelify) [![Build Status](https://www.travis-ci.com/mikesposito/tunnelify.svg?branch=master)](https://www.travis-ci.com/mikesposito/tunnelify)

A simple tool that exposes static folders from your local machine to the web

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)

## Features

#### Released

- Expose a local directory to an HTTP port

#### WIP

- Generate SSL certificates
- Create a remote accesible url
- Expose your local tunnelify server on the remote url

## Install

With npm:

```bash
npm install -g @mikesposito/tunnelify
```

## Usage

```bash
tunnelify -p <PORT> <PATH_TO_EXPOSE>
```

## Example

```bash
tunnelify -p 3000 ./dist
```

## Contributing

Every contribute is well accepted and the main goal of the project is to provide a solid software.

PRs are welcome and we are writing down some guidelines and code of conducts along with core code and documentation.

#### We hope to provode a comphensive documentation as we go through the first release we'll do as we reach a first releasable version v0.1
