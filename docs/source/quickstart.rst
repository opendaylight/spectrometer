Quick Start Guide
=================

The Spectrometer project consists of two sub-projects, the ```server``` and
```web```.

Server side is Python driven and provides the API to collect Git and Gerrit
statistics for various OpenDaylight projects.

The web project is NodeJS/React based and provides the visualization by using
the APIs provided by the server side.

In order to run the application, you need to install both ```server``` and
```web``` sub-projects.

This Quick Started Guide assumes you have Python3 and NodeJS 4.3
installed. To install NodeJS using NVM, see Web > Installation section below.

The Spectrometer project collects data from repositories located locally in
your system.


Clone spectrometer
------------------

git clone ssh://<user>@git.opendaylight.org:29418/spectrometer.git


Setup mongodb
-------------

MongoDB needs to be installed and run on it's default port, an easy way is to
use Docker to spin up a MongoDB instance.

.. code-block:: bash

    docker run -d -p 27017:27017 mongo


Setup spectrometer-server
-------------------------

.. code-block:: bash

    cd server  # From spectrometer repo root
    pip install -r requirements.txt
    python spectrometer-server -c example-config/config.py

Verify that spectrometer-server is running by going to
**http://localhost:5000**. You should see a Hello World page.


Setup spectrometer-web
----------------------

.. code-block:: bash

    cd web  # From spectrometer repo root
    npm install
    npm start

Goto **http://localhost:8000**

Testing the setup
-----------------

By default the OpenDaylight project repositories will be mirrored every
5 minutes (300s), so if this is the first time starting you may have to
wait until all repos are mirrored before you can exercise some of the
apis.

Once the repos are mirrored you can try a few basic examples to make sure
things are working properly:

Examples::

    http://127.0.0.1:5000/gerrit/branches?project=controller
    http://127.0.0.1:5000/gerrit/projects
    http://127.0.0.1:5000/git/commits?project=integration/packaging

The full  Rest APIs are documented here:
https://opendaylight-spectrometer.readthedocs.io/en/latest/restapi.html
