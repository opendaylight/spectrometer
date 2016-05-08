Developer Guide
===============

This doc provides details for developers who want to hack on spectrometer. If
you have not done so already please refer to the :doc:`quickstart`.

.. contents::
   :depth: 2
   :local:


Style Guide
-----------

We follow the Python PEP8 style guide. See:
https://www.python.org/dev/peps/pep-0008/

For documentation we follow the Python Documentation Guide. See:
https://docs.python.org/devguide/documenting.html


Spectrometer Server
-------------------

Installing in Dev Mode
^^^^^^^^^^^^^^^^^^^^^^

In development we want to install spectrometer so that we can modify the code
and use it as if in production with changes taking effect immediately. We can
achieve this using pip's editable install mode.

.. code-block:: bash

    cd server  # From spectrometer repo root
    pip install -e .
    spectrometer server start -c example-config/config.py

Testing Code
^^^^^^^^^^^^

We use tox to manage and run our unit tests. Simply run **tox** in the server
directory to initiate the tests. If you don't have tox installed typically it
is packaged as **python-tox** in most distros.

.. code-block:: bash

    cd server/  # From spectrometer repo root
    tox

Spectrometer Web
----------------

Installation
^^^^^^^^^^^^

To install NodeJS in your system, use the Node Version Manager (NVM), which
allows to co-exist multiple NodeJS versions in the same system.

If you already have NodeJS older versions (<= 0.12), it is strongly recommended \
to completely remove them and reinstall using NVM.

For Linux systems, you can do the following to remove NodeJS:

.. code-block:: bash

    which node # Note down the path
    sudo rm -r /path/bin/node /path/bin/npm /path/include/node /path/lib/node_modules ~/.npm

Install NVM, NodeJS 4.3.x and NPM:

.. code-block:: bash

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
    nvm install 4.3.1   # By default this installs npm 2.14.x
    npm install npm -g  # This will upgrade npm to 3.7.x

Run spectrometer-web
^^^^^^^^^^^^^^^^^^^^

    cd web  # From the root of the git repo
    npm install
    npm start


Goto  ```http://localhost:8000```

The web project is configured to hot-reload when any changes are made to the
code. Most of the time the web browser should auto refresh, if not simply
refresh the page.


UI Technology Stack
^^^^^^^^^^^^^^^^^^^

* NodeJS 4.3 - Bootstrapping and Universal (isomorphic) Javascript execution
* ExpressJS - Web-server-side bootstrap for UI
* ReactJS 0.14 - View Layer
* Redux - Data and State management (Flux pattern)
* Webpack - Build tool
* Babel - Asset compilation, ES6 Transpiler
* FormidableLabs VictoryChart - D3-based React components
* Redux Dev Tools - Tool that allows to track state management


Run spectrometer-web in Production
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Production build does not have Devtools and hot reloading middleware. It also
minifies scripts and css.

For Production build, execute the following commands:

.. code-block:: bash

    npm run build
    npm run start-prod


Run Test
^^^^^^^^

Unit Tests are executed using Mocha and Chai assert libraries.

.. code-block:: bash

    npm test


Roadmap
^^^^^^^

#. Dynamic loading of repositories as opposed to loading via config.json


Troubleshooting
---------------

Adding new repository
^^^^^^^^^^^^^^^^^^^^^

In order to add a new repository to collect statistics, you must make the following changes:

#. Create a soft link in ~/odl-spectrometer to the new repository
#. Edit the server/spectrometer/etc/repositories.yaml and specify the key and path to ~/odl-spectrometer/$repo
#. Edit the web/src/config.json add the project name in the list (this makes it appear in the dropdown)
#. Reload the web page
#. If reload web page does not work, restart python ```python spectrometer-server``` and web ```npm start```)
