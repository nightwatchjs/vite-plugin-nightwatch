const capitalize = (name) => name.charAt(0).toUpperCase() + name.slice(1);

module.exports = (content, componentType) => {
  return content.replace('{componentType}', capitalize(componentType));
};
