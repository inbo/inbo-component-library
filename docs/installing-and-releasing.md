# Installing & Releasing  🚀

## Installing

This library is hosted by GitHub packages which acts like an NPM registry. So it is installable from GitHub.

Even though the repository is public, you still need to authenticate with GitHub to be able to install the package
in a project. To do this, do the following:

1. Go to [GitHub token settings](https://github.com/settings/tokens)
2. Create a new classic personal access token with the `write:packages` scope (this automatically includes 
   `read:packages` as well). Optionally you can set it to expire after a certain amount of time.
3. Copy the generated token to your clipboard.
4. Create a global npm config file if it doesn't exist yet. (on Linux / MacOS it is `~/.npmrc`, for Windows it is `C:\Users\%username%\.npmrc`).
5. Add to this file the following lines:
````
//npm.pkg.github.com/:_authToken=<generated-token>
@inbo:registry=https://npm.pkg.github.com/
````
The `@inbo` scope makes sure that NPM will try to fetch any npm package that starts with `@inbo/` from GitHub 
packages registry, instead of the default NPM registry.

Now you can install this package using the regular `npm install @inbo/ng-inbo`, but there is a better way. I added 
an add schematic to this library, so you can install it using the angular-cli. Just run `ng add @inbo/ng-inbo`, 
optionally you can add `--projectName <projectName>` to specify the specific project if the angular-cli workspace has 
multiple projects in it.

The schematic installs the npm package, but it also adds the correct paths to the angular.json file, so the assets 
can be used. These assets include images and font-files (Flanders font).

### Using the inbo theme for Angular Material

Included in this library, is a theme configuration for Angular Material, that includes the INBO colors (based on the 
primary fuchsia color and generated using an online pallet generator). 

In the `styles.scss` file of your application project, you should import the theme using `@import 'inbo-theme';`. 
You should only import this once in the entire application project. To use the different color and font variables, 
you can import the variables in any scss file using `@import 'partials/variables'`. 


## Releasing

For the moment, releasing the `@inbo/ng-inbo` library is not yet automated, but ideally, this would be an Actions in GitHub.
To make a new release, you can use one of the following commands:

- `npm run release` - Creates a patch release (0.0.x) for bug fixes and small changes
- `npm run release:minor` - Creates a minor release (0.x.0) for new features that don't break existing functionality
- `npm run release:major` - Creates a major release (x.0.0) for breaking changes

These commands use the `standard-version` tool to increase the version number and push a new tag to GitHub. They will create a new build and release it to GitHub packages. 
