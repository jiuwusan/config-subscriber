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
  const template = await database.readTemplateJSON();
  const config = await database.readConfig();
  for (let index = 0; index < config.remoteSubLinks.length; index++) {
    const current = config.remoteSubLinks[index];
    let proxies = (await fetchSubLink(current.url)).proxies;
    if (proxies?.length > 0) {
      proxies = proxies.filter(item => current.type.includes(item.type) && !!current.countrys.find(country => item.name.includes(country)));
      proxies = proxies.map(item => {
        return {
          ...item,
          name: `${current.name}-${item.name}`.replace('[SS] ', '')
        };
      });
      proxies.sort((a, b) => {
        return current.countrys.findIndex((country) => a.name.includes(country)) - current.countrys.findIndex((country) => b.name.includes(country));
      });
      current.groupName = `${current.icon}${current.name}-机场`;
      current.proxieNames = proxies.map((item) => item.name);
      template.proxies.push(...proxies);
      template['proxy-groups'].push({ name: current.groupName, ...config.defaultGroup, proxies: current.proxieNames });
    }
  }
  const v1 = config.remoteSubLinks.filter((item) => item.iepl).sort((a, b) => a.level - b.level).map((item) => item.groupName);
  const v2 = config.remoteSubLinks.filter((item) => !item.iepl).sort((a, b) => a.level - b.level).map((item) => item.groupName);
  const pushProxiesToGroup = (list, keyword, proxies) => {
    const currentIndex = list.findIndex((item) => item.name.includes(keyword));
    list[currentIndex].proxies.push(...proxies);
  }

  pushProxiesToGroup(template['proxy-groups'], '节点选择', v1);
  pushProxiesToGroup(template['proxy-groups'], 'Ai平台', v1);
  pushProxiesToGroup(template['proxy-groups'], '专线', v1);
  pushProxiesToGroup(template['proxy-groups'], '中转', v2);
  return YAML.stringify(template);
};

module.exports = {
  fetchSubLink,
  createConfig
};
