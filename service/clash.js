const YAML = require('yaml');
const database = require('./database');

const fetchSubLink = async (name, link) => {
  // return database.readTestConfig();
  try {
    const result = await fetch(link, {
      headers: {
        'User-Agent': 'clash.meta'
      }
    });
    let content = await result.text();
    console.log(`${name} 订阅获取成功：${link}`);
    return YAML.parse(content);
  } catch (error) {
    console.log(`${name} 订阅获取失败：${link}`);
  }
  return { proxies: [] };
};

const renameProxieName = (countrys, name) => {
  const country = countrys.find(item => name.includes(item.en) || name.includes(item.zh));
  return name
    .replace(/-+/gi, ' ')
    .replace(new RegExp(`${country.flag} +`, 'gi'), '')
    .replace(new RegExp(`(${country.en}|${country.zh})`, 'gi'), `${country.flag} ${country.zh}`);
};

const createConfig = async type => {
  const template = await database.readTemplateJSON(type);
  const config = await database.readConfig(type);
  const countrys = await database.readCountrys(type);
  for (let index = 0; index < config.remoteSubLinks.length; index++) {
    const current = config.remoteSubLinks[index];
    if (current.disabled) {
      continue;
    }
    let proxies = (await fetchSubLink(current.name, current.link)).proxies;
    if (proxies?.length > 0) {
      proxies = proxies.filter(item => current.type.includes(item.type) && !!current.countrys.find(country => item.name.includes(country)));
      proxies.sort((a, b) => {
        return current.countrys.findIndex(country => a.name.includes(country)) - current.countrys.findIndex(country => b.name.includes(country));
      });
      proxies = proxies.map(item => {
        return {
          ...item,
          name: renameProxieName(countrys, `${current.name} ${item.name}`)
        };
      });
      // 默认第二项作为默认代理
      proxies.length > 1 && ([proxies[0], proxies[1]] = [proxies[1], proxies[0]]);
      current.groupName = `${current.icon} ${current.name} 机场`;
      current.proxieNames = proxies.map(item => item.name);
      template.proxies.push(...proxies);
      const currentGroup = { name: current.groupName, ...config.defaultGroup, proxies: current.proxieNames };
      current.interval && (currentGroup.interval = current.interval);
      template['proxy-groups'].push(currentGroup);
    }
  }
  const v1 = config.remoteSubLinks
    .filter(item => !!item.groupName && item.iepl)
    .sort((a, b) => a.level - b.level)
    .map(item => item.groupName);
  const v2 = config.remoteSubLinks
    .filter(item => !!item.groupName && !item.iepl)
    .sort((a, b) => a.level - b.level)
    .map(item => item.groupName);
  const pushProxiesToGroup = (list, keyword, proxies) => {
    const currentIndex = list.findIndex(item => item.name.includes(keyword));
    list[currentIndex].proxies.push(...proxies);
  };

  pushProxiesToGroup(template['proxy-groups'], '节点选择', [...v1, ...v2]);
  pushProxiesToGroup(template['proxy-groups'], 'Ai平台', [...v1, ...v2]);
  pushProxiesToGroup(template['proxy-groups'], '专线', v1);
  pushProxiesToGroup(template['proxy-groups'], '中转', v2);
  return YAML.stringify(template);
};

module.exports = {
  fetchSubLink,
  createConfig
};
