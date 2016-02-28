import React from 'react';
import { render } from 'react-dom';
import DevTools from '../common/utils/DevTools';

export default function createDevToolsWindow(store) {
  const popup = window.open(null, 'Redux DevTools', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=200');
  // Reload in case it already exists
  popup.location.reload();

  setTimeout(() => {
    popup.document.write('<div id="react-devtools-root"></div>');
    render(
      <DevTools store={store} />,
      popup.document.getElementById('react-devtools-root')
    );
  }, 10);
}
