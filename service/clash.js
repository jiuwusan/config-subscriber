const YAML = require('yaml');
const database = require('./database');

const isBase64 = str => {
  if (typeof str !== 'string') return false;
  // Base64 的正则（允许末尾 = 填充）
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str);
};

const fetchSubLink = async url => {
  return database.readTestConfig();
  // const result = await fetch(url);
  // let content = await result.text();
  // if (isBase64(content)) {
  //   content = Buffer.from(content, 'base64').toString('utf8');
  // }
  // return YAML.parse(content);
};

const createConfig = async () => {
  const config = await database.readTemplateJSON();
  const subLinks = await database.readRemoteSubLinks();
  for (let index = 0; index < subLinks.length; index++) {
    const current = subLinks[index];
    let proxies = (await fetchSubLink(current.url)).proxies;
    if (proxies?.length > 0) {
      proxies = proxies.filter(item => !!current.countrys.find(country => item.name.includes(country)));
      proxies = proxies.map(item => {
        return {
          ...item,
          name: `${current.name}-${item.name}`
        };
      });
      current.proxies = proxies;
    }
  }
  return subLinks;
};

module.exports = {
  fetchSubLink,
  createConfig
};
