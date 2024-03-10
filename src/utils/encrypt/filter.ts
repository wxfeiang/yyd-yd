import { useSystemStore } from '@/store/modules/system';
import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
import { sm2, sm4 } from 'sm-crypto';
const store = useSystemStore();

let API_ENCRYPT_KEY: string =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp5t8glnlZKID+pMuDrOSdHB5ADX3sh9EeSaEk0LdydPKR/+xSp63xlIx1FJRaTdljWDaLx3NTVJn5cyEOV3kXU/2diDVPBUOrfljJGFC1FaZh70tO8KWJNQZErImIHYTeDie5yV9Kk55ZYH6p6zjTWZHZ3+tYKWyLef107twkxQhDSDM6mjKfpT6UCvewLrRLa4CM2HR+bvbizNlVWAtYajhtkmDZdQPNHw92ujqltf5GOBVY98KN+VKfRhor7XZeKaXX23KLAyGzpY+PkhHm5ksG3dDXQdtHjQJ+VZD/EcPBMICTwhfgZsLtwgWbqgEat5j9AHHRyDKmUZkmY+DzQIDAQAB';
const API_ENCRYPT_WHITE = [
  '*.js',
  '*.css',
  '*.json',
  '*.html',
  '*.png',
  '.jpg',
  '.gif',
];
let API_ENCRYPT_PARAM: any = [];
let API_ENCRYPT_EXPAND: any = {};
let API_ENCRYPT_HEADER = 'puubke';
let API_ENCRYPT_ENABLE = true;
let API_ENCRYPR_TYPE = 'aes';
let AES_KEY: any = ''; //
export function createFilter<T>(method: T) {
  const utils = {
    getConf: async () => {
      if (store.filterData && store.filterData.headerKey) {
        const data = store.filterData;

        API_ENCRYPT_KEY = data.paramId || API_ENCRYPT_KEY;
        API_ENCRYPT_ENABLE = data.enable;
        API_ENCRYPT_PARAM = data.paramList;
        API_ENCRYPT_EXPAND = data.expandMap;
        API_ENCRYPT_HEADER = data.headerKey;
        API_ENCRYPR_TYPE = data.type;
      }

      // let a = await
      //
      // AES_KEY = 'ybgxtxy8vcren2e1';
      utils.onRequest(method);
    },
    onRequest: (method: any) => {
      if (!API_ENCRYPT_ENABLE) {
        return method;
      }
      const { config } = method;
      const aesKey = AES_KEY;

      if (!method?.meta?.ignorEencrypt) {
        if (method.type === 'GET' && method.url.indexOf('?') > -1) {
          method.url = utils.buildUrl(method.url, aesKey);
        } else {
          const body: any = JSON.stringify(method.data);
          // 处理 body 参数为 json 格式
          if (body && typeof body == 'string' && utils.isJSON(body)) {
            if (Object.keys(JSON.parse(body)).length > 0) {
              method.data = utils.syEncry(body, aesKey);
            } else {
              method.data = '';
            }
          }
          // 处理 body 为字符串的参数
          if (body && typeof body == 'string' && !utils.isJSON(body)) {
            method.data = utils.changeJsonParam(
              method.body,
              method.url,
              aesKey,
            );
          }

          // 处理 body 为 FormData 的参数
          if (body && utils.isFormData(body)) {
            body.forEach((v: any, k: any) => {
              if (!v) {
                body.set(k, '');
              } else if (API_ENCRYPT_PARAM.indexOf(k) > -1) {
                body.set(k, v);
              } else if (Object.keys(API_ENCRYPT_EXPAND).length > 0) {
                let isEncrypt = true;
                for (const u in API_ENCRYPT_EXPAND) {
                  const key = u.replaceAll('-', '/');
                  const val = API_ENCRYPT_EXPAND[u];
                  if (method.url.indexOf(key) > -1 && val.indexOf(k) > -1) {
                    isEncrypt = false;
                  }
                }
                if (isEncrypt) {
                  body.set(k, utils.syEncry(v, aesKey));
                } else {
                  body.set(k, v);
                }
              } else {
                v = decodeURIComponent(v);
                body.set(k, utils.syEncry(v, aesKey));
              }
            });
            method.data = body;
          }

          // 处理 url 上的参数
          if (method.url.indexOf('?') > -1) {
            method.url = utils.buildUrl(method.url, aesKey);
          }
        }
        // 处理 params
        if (
          method.url.indexOf('?') == -1 &&
          Object.keys(config.params).length > 0
        ) {
          const params = JSON.stringify(config.params);
          config.params = utils.changeJsonParam(params, method.url, aesKey);
        }

        const headers = { ...config.headers };
        headers[API_ENCRYPT_HEADER] = utils.asyEncry(aesKey, API_ENCRYPT_KEY);
        config.headers = headers;
        method.config = config;
      }
    },

    /**
     * 判断是否json字符串
     * @param { } str
     * @returns
     */
    isJSON: (str: string) => {
      if (typeof str == 'string') {
        try {
          JSON.parse(str);
          return true;
        } catch (e) {
          return false;
        }
      }
    },
    /**
     * 处理url参数加密
     * @param {*} url
     */
    buildUrl: (url: string, aeskey: string) => {
      url = decodeURIComponent(url);
      let params: any = {},
        tempArr:any = [];
      tempArr = url.split('?')[1].split('&');
      tempArr.forEach((v) => {
        if (v.split('=')[0] && v.split('=')[0].indexOf('[]') >= 0) {
          //如果参数是数组 进行处理
          const key = v.split('=')[0].replace(/\[\]/, '');
          if (params[key]) {
            params[key].push(v.split('=')[1]);
          } else {
            params[key] = [v.split('=')[1]];
          }
        } else {
          params[v.split('=')[0]] = v.split('=')[1];
        }
      });
      if (params) {
        params = utils.encryptParam(params, url, aeskey);
        let path = url.split('?')[0] + '?';
        for (const k in params) {
          path +=
            (path.indexOf('=') != -1 ? '&' : '') +
            k +
            '=' +
            encodeURIComponent(params[k]);
        }
        url = path;
      }
      return url;
    },
    // json 参数转化
    changeJsonParam: (body: any, url: string, aesKey: string) => {
      const debody = decodeURIComponent(body);
      let params: any = {},
        tempArr:any = [];
      tempArr = debody.split('&');
      tempArr.map((v) => (params[v.split('=')[0]] = v.split('=')[1]));
      let bodyStr = '';
      if (params) {
        params = utils.encryptParam(params, url, aesKey);

        for (const k in params) {
          bodyStr +=
            (bodyStr.indexOf('=') != -1 ? '&' : '') +
            k +
            '=' +
            encodeURIComponent(params[k]);
        }
      }
      return bodyStr;
    },

    md5: (data: string) => {
      return CryptoJS.MD5(data).toString();
    },
    // rsa 加密
    rsaEncrypt: (data: string, key: string) => {
      const encryptTool = new JSEncrypt();
      encryptTool.setPublicKey(key);
      return encryptTool.encrypt(data);
    },

    // aes 加密
    aesEncrypt: (data: string, key: string) => {
      const readyKey = CryptoJS.enc.Utf8.parse(key);
      const readyText = CryptoJS.enc.Utf8.parse(data);
      const encryptedText = CryptoJS.AES.encrypt(readyText, readyKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encryptedText.toString();
    },

    // sm4加密
    sm4Encrypt: (data: string, key: string) => {
      // @ts-ignore
      return sm4.encrypt(data, key, { mode: 'ecb' });
    },

    //sm2加密
    sm2Encrypt: (data: string, key: string) => {
      return '04' + sm2.doEncrypt(data, key, 1).toUpperCase();
    },

    // 生成随机的加密key
    getAesKey: (len?: number) => {
      const length = len || 16;
      let key = '';
      if (API_ENCRYPR_TYPE == 'sm') {
        key = utils.md5(
          window.crypto.getRandomValues(new Uint32Array(1))[0] as any,
        );
      }
      key = utils
        .md5(window.crypto.getRandomValues(new Uint32Array(1))[0] as any)
        .substring(0, length);

       AES_KEY = key;

    },

    /**
     * AES 加密各参数
     */
    encryptParam: (param: any, url: string, aeskey: string) => {
      const obj: any = {};
      for (const prop in param) {
        if (!param[prop]) {
          obj[prop] = '';
        } else if (API_ENCRYPT_PARAM.indexOf(prop) > -1) {
          obj[prop] = param[prop];
        } else if (Object.keys(API_ENCRYPT_EXPAND).length > 0) {
          let isEncrypt = true;
          for (const k in API_ENCRYPT_EXPAND) {
            const key = k.replaceAll('-', '/');
            const value = API_ENCRYPT_EXPAND[k];
            if (url.indexOf(key) > -1 && value.indexOf(prop) > -1) {
              isEncrypt = false;
            }
          }
          if (isEncrypt) {
            obj[prop] = utils.syEncry(param[prop].toString(), aeskey);
          } else {
            obj[prop] = param[prop];
          }
        } else {
          obj[prop] = utils.syEncry(param[prop].toString(), aeskey);
        }
      }

      return obj;
    },

    // 对称加密
    syEncry: (data: string, key: string) => {
      if (API_ENCRYPR_TYPE == 'sm') {
        return utils.sm4Encrypt(data, key);
      }
      return utils.aesEncrypt(data, key);
    },
    // 非对称加密
    asyEncry: (data: string, key: string) => {
      if (API_ENCRYPR_TYPE == 'sm') {
        return utils.sm2Encrypt(data, key);
      }
      return utils.rsaEncrypt(data, key);
    },
    isFormData: (v: any) => {
      return Object.prototype.toString.call(v) === '[object FormData]';
    },
  };
  utils.getAesKey();
  utils.getConf();
  return method;
}
