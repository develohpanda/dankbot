'use strict';

import test from 'ava';
import sinon from 'sinon';

const Logger = require('../lib/logger.js');

test.beforeEach(() => {
  sinon.stub(console, 'log');
});

test.afterEach(() => {
  console.log.restore();
});

test('Can trace', (t) => {
  t.notThrows(() => {
    Logger.trace('balls');
  });
});

test('Can log exception', (t) => {
  t.notThrows(() => {
    Logger.logError({}, 'balls');
  });
});
