window.TOEIC = window.TOEIC || {};

TOEIC.DataLoader = {
  _ver() {
    return window.APP_VERSION || Date.now();
  },

  async _fetchJSON(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.json();
  },

  async _fetchSharded(basePath) {
    const baseUrl = basePath + '.json?v=' + this._ver();
    const extUrl  = basePath + '_ext1.json?v=' + this._ver();
    const results = await Promise.allSettled([
      this._fetchJSON(baseUrl),
      this._fetchJSON(extUrl)
    ]);
    const base = results[0].status === 'fulfilled' ? results[0].value : null;
    if (!base) return null;
    const ext = results[1].status === 'fulfilled' ? results[1].value : null;
    if (Array.isArray(base) && Array.isArray(ext)) {
      return base.concat(ext);
    }
    return base;
  },

  async loadPart1(track) {
    try {
      return await this._fetchSharded('data/listening_part1_' + track);
    } catch (e) {
      console.warn('loadPart1 failed:', e);
      return null;
    }
  },

  async loadPart2(track) {
    try {
      return await this._fetchSharded('data/listening_part2_' + track);
    } catch (e) {
      console.warn('loadPart2 failed:', e);
      return null;
    }
  },

  async loadPart3(track) {
    try {
      return await this._fetchSharded('data/listening_part3_' + track);
    } catch (e) {
      console.warn('loadPart3 failed:', e);
      return null;
    }
  },

  async loadPart4(track) {
    try {
      return await this._fetchSharded('data/listening_part4_' + track);
    } catch (e) {
      console.warn('loadPart4 failed:', e);
      return null;
    }
  },

  async loadPart5(track) {
    try {
      return await this._fetchSharded('data/reading_part5_' + track);
    } catch (e) {
      console.warn('loadPart5 failed:', e);
      return null;
    }
  },

  async loadPart6(track) {
    try {
      return await this._fetchSharded('data/reading_part6_' + track);
    } catch (e) {
      console.warn('loadPart6 failed:', e);
      return null;
    }
  },

  async loadPart7(track) {
    const subtypes = ['single', 'double', 'triple'];
    const all = [];
    for (const sub of subtypes) {
      try {
        const data = await this._fetchSharded('data/reading_part7_' + sub + '_' + track);
        if (Array.isArray(data)) all.push(...data);
      } catch (e) {
        console.warn('loadPart7 ' + sub + ' failed:', e);
      }
    }
    return all.length > 0 ? all : null;
  }
};
