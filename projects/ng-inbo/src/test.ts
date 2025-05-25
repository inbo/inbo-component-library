// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'core-js';
import 'zone.js';
import 'zone.js/testing';

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    <T>(id: string): T;
    keys(): Array<string>;
  };
};

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);
