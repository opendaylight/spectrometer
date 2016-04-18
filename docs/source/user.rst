User Guide
==========

Production Deployment
---------------------

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
