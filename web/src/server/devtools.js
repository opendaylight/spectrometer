/**
# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################
*/

/**
 * Redux Dev Tools, available only in development build
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import React from 'react';
import { render } from 'react-dom';
import DevTools from './utils/devtools';

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
