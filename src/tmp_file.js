const fs = require("fs");

const TMP_TEST_FILE = "_tmp_test_file.js";

/**
 * Flushes the content to the FS as the virtual test.
 *
 * @param {string} content
 * @returns {Promise<void>}
 */
const write = (content) =>
  fs.promises.writeFile(TMP_TEST_FILE, content, {
    encoding: "utf8",
  });

/**
 * Removes the virtual test file from the FS.
 *
 * @returns {Promise<void>}
 */
const clean = () =>
  fs.promises.unlink(TMP_TEST_FILE).catch((error) => {
    if (error.code === "ENOENT") {
      // The file doesn't exist and it is okay. Just do nothing.
    } else {
      throw error;
    }
  });

exports.TMP_TEST_NAME = TMP_TEST_FILE;
exports.writeTmpTestFile = write;
exports.removeTmpTestFile = clean;
