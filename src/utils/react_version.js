const {version} = require('react/package.json');

exports.ReactVersion = version;
exports.ReactIsLessThan18 = () => parseInt(version, 10) < 18;