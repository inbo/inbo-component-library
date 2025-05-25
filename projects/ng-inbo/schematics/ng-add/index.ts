import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

interface AssetConfig {
  glob: string;
  input: string;
  output: string;
}

interface ProjectArchitectBuildOptions {
  assets: Array<AssetConfig | string>;
}

interface ProjectArchitectBuild {
  options: ProjectArchitectBuildOptions;
}

interface ProjectArchitect {
  build: ProjectArchitectBuild;
}

interface Project {
  architect: ProjectArchitect;
}

interface AngularJson {
  projects: Record<string, Project>;
}

export const ngAdd = (options: { projectName: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    const angularJsonPath = 'angular.json';
    const angularConfig = tree.readJson(
      angularJsonPath
    ) as unknown as AngularJson;

    if (!angularConfig) {
      throw new Error('Not an Angular CLI workspace');
    }

    const project = angularConfig.projects[options.projectName];
    if (!project) {
      throw new Error(
        `Project ${options.projectName} not found in angular.json`
      );
    }

    const buildOptions = project.architect?.build?.options;
    if (!buildOptions) {
      throw new Error(
        `Build options not found for project ${options.projectName}`
      );
    }

    const buildOptionsAssets = buildOptions.assets;

    const ngInboAssetsConfig: AssetConfig = {
      glob: '**/*',
      input: './node_modules/@inbo/ng-inbo/assets/',
      output: './assets/',
    };
    if (
      !buildOptionsAssets.some(
        asset =>
          typeof asset === 'object' && asset.input === ngInboAssetsConfig.input
      )
    ) {
      buildOptionsAssets.push(ngInboAssetsConfig);
      tree.overwrite(angularJsonPath, JSON.stringify(angularConfig, null, 2));
    }
    return tree;
  };
};
