const path = require('path');
const fs = require('fs-extra');
const YAML = require('yaml');

const getFilePath = (filename = '') => {
  const rootPath = path.dirname(__dirname);
  return path.join(rootPath, filename);
};

const readTemplateJSON = () => {
  const templatePath = getFilePath('database/template.yaml');
  return YAML.parse(fs.readFileSync(templatePath, 'utf-8'));
};

const readTestConfig = () => {
  const templatePath = getFilePath('database/FlyingBird.yaml');
  return YAML.parse(fs.readFileSync(templatePath, 'utf-8'));
};

const readConfig = () => {
  const filePath = getFilePath('database/config.json');
  return fs.readJSONSync(filePath);
};

module.exports = {
  getFilePath,
  readTemplateJSON,
  readConfig,
  readTestConfig
};
