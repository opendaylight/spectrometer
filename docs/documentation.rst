Documentation Guide
===================

This guide provides details on how to contribute to the documetantion of
Spectrometer. The style guide we follow for documentation is the python
documentation style guide. See:

    https://docs.python.org/devguide/documenting.html

To build and review the documentation locally you can simply run tox and open
the html via your favourite web browser.

.. code-block:: bash

    tox -edocs
    firefox .tox/docs/tmp/html/index.html
