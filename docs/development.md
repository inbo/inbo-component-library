# Library development

Due to this being a library and not usable as an individual application, you can only view / test the components by using them in a 'host' application.
This may lead to may back and forth switching between the library and the application, during development.
For ease of development, I recommend the following tool: [install-local-dependencies](https://www.npmjs.com/package/install-local-dependencies),
to install and watch this library as a local dependency.

You can install it globally by running:

```shell
npm i -g install-local-dependencies
```

**Note:** when using a Node.js version manager, make sure to install it in the Node.js version used by the 'host' application of the library.

## Usage

### Watch the library for changes

Run `npm run watch` in the library's (this) workspace.

### Install into the host application

In the host application's workspace,

1. Run `npm install <relative path>/dist/ng-inbo`.<br>
   Where `<relative path>` points to the library's workspace, relative to the host application.
2. Run `install-local-dependencies`
3. Run `watch-local-dependencies`
4. Start the host application

## Details

When npm installs package from a local folder on your computer, it does not automatically install the dependencies
of the dependencies. It only does that when installing from a package registry. This tool allows you to install the
other dependencies as well, and it also has a watch function that checks if the dependencies of your library change,
and installs those as well, although this is usually not necessary because you don't really add new dependencies all
that often.
