VoidJS.com [![Build Status](https://travis-ci.org/edj-boston/voidjs-com.svg?branch=master)](https://travis-ci.org/edj-boston/voidjs-com) [![Dependency Status](https://david-dm.org/edj-boston/voidjs-com.svg)](https://david-dm.org/edj-boston/voidjs-com) [![devDependency Status](https://david-dm.org/edj-boston/voidjs-com/dev-status.svg)](https://david-dm.org/edj-boston/voidjs-com#info=devDependencies)
==========

The [site](https://voidjs.com) of the [Void](https://github.com/edj-boston/void) NodeJS [module](https://npmjs.org/package/void).


Install
-------

Clone the repo, `cd` to it, install gulp globally, then install the rest of the dependencies with npm.

```sh
$ cd voidjs-com
$ npm install -g gulp
$ npm install
```


Run
---

Run the default `gulp` task. The port will default to 3000.

```sh
$ gulp
```

Optionally, pass a port for the local server to bind to and listen on.

```sh
$ gulp -p 3001
```

Editing files in the `src` directory will automatically trigger a build.

Then navigate to `http://localhost:3000` in your browser.
