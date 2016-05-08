User Guide
==========

Spectrometer consists of 3 components:

- Spectrometer API Server (backend)
- Spectrometer Web Server (frontend)
- Spectrometer Report Tool

This guide will describe the uses of the 3 systems.


Spectrometer API Server
-----------------------

Production Deployment
^^^^^^^^^^^^^^^^^^^^^

When running in production the recommended way is to deploy with gunicorn.

.. code-block:: bash

    gunicorn -b 0.0.0.0:5000 'spectrometer:run_app()'

If deploying behind a proxy under a sub-directory additional configuration is
necessary for gunicorn application to operate correctly.

example-nginx::

    location /api {
        proxy_pass         http://127.0.0.1:5000;
        proxy_redirect     http://127.0.0.1:5000/api/ http://$host/api/;

        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header   SCRIPT_NAME      /api;
    }

Logging
^^^^^^^

Spectrometer logs to /var/log/spectrometer by default but that directory must
be writeable by the spectrometer user.

.. code-block:: bash

    sudo chown spectrometer /var/log/spectrometer

It is possible to override the default log directory by configuring the LOG_DIR
parameter in config.py.

.. code-block:: python

    LOG_DIR = '/path/to/log/directory'


Spectrometer Web Server
-----------------------

TODO


Spectrometer Report Tool
------------------------

The Spectrometer Report Tool can be used to generate reports between 2
reference points in time. Reference points are git commit hashs, branches, or
tags. A project like OpenDaylight that tags projects with the same tag name for
every release can use this tool to Generate release reports.

.. code-block:: bash

    # spectrometer reporttool full <ref1> <ref2>
    spectrometer reporttool --server-url=https://spectrometer.opendaylight.org/api full release/beryllium-sr2 release/beryllium-sr1
