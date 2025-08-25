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

const getCountrys = (() => {
  let countrys = [];
  return () => {
    countrys?.length < 1 && (countrys = database.readCountrys());
    return countrys;
  };
})();

const renameProxieName = name => {
  const countrys = getCountrys();
  const country = countrys.find(item => name.includes(item.en) || name.includes(item.zh));
  return name
    .replace(/-+/gi, ' ')
    .replace(new RegExp(`${country.flag} +`, 'gi'), '')
    .replace(new RegExp(`(${country.en}|${country.zh})`, 'gi'), `${country.flag} ${country.zh}`);
};

const formatGroup = (proxies, countrys, type, name, icon, interval = 305) => {
  let configProxies = proxies.filter(item => type.includes(item.type) && !!countrys.find(country => item.name.includes(country)));
  configProxies.sort((a, b) => {
    return countrys.findIndex(country => a.name.includes(country)) - countrys.findIndex(country => b.name.includes(country));
  });
  configProxies = configProxies.map(item => {
    return {
      ...item,
      name: renameProxieName(`${name} ${item.name}`)
    };
  });
  // 默认第二项作为默认代理
  configProxies.length > 1 && ([configProxies[0], configProxies[1]] = [configProxies[1], configProxies[0]]);
  return {
    name: `${icon} ${name} 机场`,
    interval,
    type: 'fallback',
    url: 'http://www.gstatic.com/generate_204',
    proxies: configProxies.map(item => item.name),
    configProxies
  };
};

const createConfig = async type => {
  const template = database.readTemplateJSON(type);
  const config = database.readConfig(type);
  let v1 = [],
    v2 = [],
    v3 = [];
  for (let index = 0; index < config.remoteSubLinks.length; index++) {
    const { disabled, name, link, countrys, provinces, type, icon, interval = 305, iepl, level } = config.remoteSubLinks[index];
    if (disabled) {
      continue;
    }
    const proxies = (await fetchSubLink(name, link)).proxies;
    if (proxies?.length > 0) {
      // 国家
      const group1 = formatGroup(proxies, countrys, type, name, icon, interval);
      template.proxies.push(...group1.configProxies);
      delete group1.configProxies;
      template['proxy-groups'].push(group1);
      group1.proxies.length > 0 && (iepl ? v1.push({ name: group1.name, level }) : v2.push({ name: group1.name, level }));

      // 香港、台湾
      if (provinces?.length > 0) {
        let group2 = formatGroup(proxies, provinces, type, name, '🚩', interval);
        template.proxies.push(...group2.configProxies);
        delete group2.configProxies;
        template['proxy-groups'].push(group2);
        group2.proxies.length > 0 && v3.push({ name: group2.name, level });
      }
    }
  }

  // 去重节点
  template.proxies = [...new Map(template.proxies.map(item => [item.name, item])).values()];

  v1 = v1.sort((a, b) => b.iepl - a.iepl || a.level - b.level).map(item => item.name);
  v2 = v2.sort((a, b) => b.iepl - a.iepl || a.level - b.level).map(item => item.name);
  v3 = v3.sort((a, b) => b.iepl - a.iepl || a.level - b.level).map(item => item.name);

  const pushProxiesToGroup = (list, keyword, proxies, insertIndex) => {
    const currentIndex = list.findIndex(item => item.name.includes(keyword));
    if (currentIndex > -1) {
      typeof insertIndex === 'number' ? list[currentIndex].proxies.splice(insertIndex, 0, ...proxies) : list[currentIndex].proxies.push(...proxies);
    }
  };

  pushProxiesToGroup(template['proxy-groups'], '节点选择', [...v1, ...v2, ...v3]);
  pushProxiesToGroup(template['proxy-groups'], 'Ai平台', [...v1, ...v2, ...v3]);
  pushProxiesToGroup(template['proxy-groups'], '专线', v1);
  pushProxiesToGroup(template['proxy-groups'], '中转', v2);
  pushProxiesToGroup(template['proxy-groups'], '重型货机', v3, 2);

  return YAML.stringify(template);
};

module.exports = {
  fetchSubLink,
  createConfig
};
