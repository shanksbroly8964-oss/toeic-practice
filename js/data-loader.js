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

  async loadPart1(track) {
    const url = 'data/listening_part1_' + track + '.json?v=' + this._ver();
    try {
      return await this._fetchJSON(url);
    } catch (e) {
      console.warn('loadPart1 failed:', e);
      return null;
    }
  },

  async loadPart2(track) {
    const url = 'data/listening_part2_' + track + '.json?v=' + this._ver();
    try {
      return await this._fetchJSON(url);
    } catch (e) {
      console.warn('loadPart2 failed:', e);
      return null;
    }
  },

  async loadPart3(track) {
    const url = 'data/listening_part3_' + track + '.json?v=' + this._ver();
    try {
      return await this._fetchJSON(url);
    } catch (e) {
      console.warn('loadPart3 failed:', e);
      return null;
    }
  },

  async loadPart4(track) {
    const url = 'data/listening_part4_' + track + '.json?v=' + this._ver();
    try {
      return await this._fetchJSON(url);
    } catch (e) {
      console.warn('loadPart4 failed:', e);
      return null;
    }
  },

  async loadPart5(track) {
    const url = 'data/reading_part5_' + track + '.json?v=' + this._ver();
    try {
      return await this._fetchJSON(url);
    } catch (e) {
      console.warn('loadPart5 failed:', e);
      return null;
    }
  },

  async loadPart6(track) {
    const url = 'data/reading_part6_' + track + '.json?v=' + this._ver();
    try {
      return await this._fetchJSON(url);
    } catch (e) {
      console.warn('loadPart6 failed:', e);
      return null;
    }
  },

  async loadPart7(track) {
    const subtypes = ['single', 'double', 'triple'];
    const all = [];
    for (const sub of subtypes) {
      const url = 'data/reading_part7_' + sub + '_' + track + '.json?v=' + this._ver();
      try {
        const data = await this._fetchJSON(url);
        if (Array.isArray(data)) all.push(...data);
      } catch (e) {
        console.warn('loadPart7 ' + sub + ' failed:', e);
      }
    }
    return all.length > 0 ? all : null;
  }
};
