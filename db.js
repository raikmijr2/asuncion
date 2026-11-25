'use strict';

/* Almacenamiento local con IndexedDB: nada sale de este dispositivo. */
const DB = (() => {
  let dbp = null;

  function open() {
    if (!dbp) {
      dbp = new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) return reject(new Error('Este navegador no permite guardar datos'));
        const r = indexedDB.open('asuncion', 1);
        r.onupgradeneeded = () => {
          const db = r.result;
          for (const s of ['stages', 'entries', 'audios']) {
            if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        };
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    }
    return dbp;
  }

  const req = (r) => new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });

  async function read(name) {
    return (await open()).transaction(name, 'readonly').objectStore(name);
  }

  async function write(name, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(name, 'readwrite');
      fn(tx.objectStore(name));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  return {
    all: async (name) => req((await read(name)).getAll()),
    get: async (name, id) => req((await read(name)).get(id)),
    put: (name, obj) => write(name, (s) => s.put(obj)),
    del: (name, id) => write(name, (s) => s.delete(id)),
    kvGet: async (key) => req((await read('kv')).get(key)),
    kvSet: (key, value) => write('kv', (s) => s.put(value, key)),
  };
})();
