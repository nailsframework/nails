import { State } from './core/state';

const get = (
  url: string,
  state: State,
  callback: (text: string, code: number) => void
) => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.open('GET', url, true);

  if (typeof state.data.headers !== 'undefined') {
    for (const header of state.data.headers) {
      xmlHttp.setRequestHeader(
        Object.keys(header)[0],
        header[Object.keys(header).pop()]
      );
    }
  }
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4) {
      callback(JSON.parse(xmlHttp.responseText), xmlHttp.status);
    }
  };
  xmlHttp.send(null);
};
