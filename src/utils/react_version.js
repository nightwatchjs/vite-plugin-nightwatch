const {version} = require('react/package.json');

exports.ReactVersion = version;
exports.isReact18 = () => parseInt(version, 10) === 18;