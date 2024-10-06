export const JSON_HTTP_OPTIONS: Object = {
  headers: {
    'Accept': 'application/json',
    'Accept-language': 'bg',
  },
  responseType: 'json'
};

export const STRING_HTTP_OPTIONS: Object = {
  responseType: 'text'
};

export const BLOB_HTTP_OPTIONS: Object = {
  headers: {
    'Content-type': 'application/octet-stream',
    'Accept-language': 'bg',
  },
  responseType: 'blob',
};

export const TOKEN_KEY = 'INVENTORY_TOKEN';