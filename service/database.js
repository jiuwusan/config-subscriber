const path = require('path');
const fs = require('fs-extra');
const YAML = require('yaml');

const getFilePath = (filename = '') => {
  const rootPath = path.dirname(__dirname);
  return path.join(rootPath, 'database', filename);
};

const readTemplateJSON = type => {
  const templatePath = getFilePath(`${type}/template.yaml`);
  return YAML.parse(fs.readFileSync(templatePath, 'utf-8'));
};

const readConfig = type => {
  const filePath = getFilePath(`${type}/config.json`);
  return fs.readJSONSync(filePath);
};

const readCountrys = () => {
  const filePath = getFilePath(`countrys.json`);
  return fs.readJSONSync(filePath);
};

const readTestConfig = () => {
  const templatePath = getFilePath('test/FlyingBird.yaml');
  return YAML.parse(fs.readFileSync(templatePath, 'utf-8'));
};

module.exports = {
  getFilePath,
  readTemplateJSON,
  readConfig,
  readTestConfig,
  readCountrys
};
