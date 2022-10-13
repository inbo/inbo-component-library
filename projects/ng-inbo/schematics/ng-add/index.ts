import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';

export const ngAdd = (options: { project: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    const angularJsonPath = 'angular.json';
    const angularConfig: any = tree.readJson(angularJsonPath);

    if (!angularConfig) {
      throw new Error('Not an Angular CLI workspace');
    }

    const buildOptionsAssets: Array<any> = angularConfig['projects'][options.project]['architect']['build']['options']['assets'];
    const ngInboAssetsConfig = {
      'glob': '**/*',
      'input': './node_modules/@inbo/ng-inbo/assets/',
      'output': './assets/',
    };
    if (!buildOptionsAssets.some(asset => asset.input === './node_modules/@inbo/ng-inbo/assets/')) {
      buildOptionsAssets.push(ngInboAssetsConfig);
      tree.overwrite(angularJsonPath, JSON.stringify(angularConfig, null, 2));
    }
    return tree;
  };
};
