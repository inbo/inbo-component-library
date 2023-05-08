# Development

Due to this being a library and not usable as something standalone, you can only view / test the components by using
them in an application. 
For ease of development, I recommend the following tool:
[install-local-dependencies ](https://www.npmjs.com/package/install-local-dependencies)

You can install it globally by running `npm i -g install-local-dependencies`.

When npm installs package from a local folder on your computer, it does not automatically install the dependencies 
of the dependencies. It only does that when installing from a package registry. This tool allows you to install the 
other dependencies as well, and it also has a watch function that checks if the dependencies of your library change, 
and installs those as well, although this is usually not necessary because you don't really add new dependencies all 
that often.

1. Run `npm run watch` in this repo.
2. Run `npm install <relative path to this repo from the application>/dist/ng-inbo` in the folder of the application 
   you are developing
3. Run `install-local-dependencies`
4. Run `watch-local-dependencies`
5. Start your application
6. Develop.
