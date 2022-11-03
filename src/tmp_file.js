const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const TMP_TEST_FILE = '__tmp_test_file.js';
const dirName = path.resolve(path.join('nightwatch', '.cache'));

/**
 * Flushes the content to the FS as the virtual test.
 *
 * @param {string} content
 * @param {string} fileName
 * @returns {Promise<void>}
 */
const write = function({content, fileName = TMP_TEST_FILE}) {
  return mkdirp(dirName).then(_ => {
    return fs.promises.writeFile(path.join(dirName, fileName), content, {
      encoding: 'utf8'
    });
  });
};

/**
 * Removes the virtual test file from the FS.
 *
 * @returns {Promise<void>}
 */
const clean = function(fileName = TMP_TEST_FILE) {
  return fs.promises.unlink(path.join(dirName, fileName)).catch((error) => {
    if (error.code === 'ENOENT') {
      // The file doesn't exist and it is okay. Just do nothing.
    } else {
      throw error;
    }
  });
};

exports.TMP_TEST_NAME = TMP_TEST_FILE;
exports.writeTmpTestFile = write;
exports.removeTmpTestFile = clean;
