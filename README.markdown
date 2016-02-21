# spectrometer2

### Installation
```
$ cd server/
$ pip install -r requirements.txt
$ python spectrometer-server
```

open a browswer
`http://127.0.0.1:5000/git/commits/test`
must show commits log from local directory of spectrometer2.

### Usage
Add a repository address to etc/repositories.yaml
with the following format
```
modulename:
  repo: path/to/bare_repo/directory
```
Now the flask application must be up and serve requests:
```
$ python spectrometer-server
```
Now `http://127.0.0.1:5000/git/commits/:modulename` will return repository log of added repository address in *yaml* file.
`http://127.0.0.1:5000/git/commits/:modulename/:branchname` will return commits on that branch and parents commits to them that
are not in `master` branch. An example can be `http://127.0.0.1:5000/git/commits/aaa/stable/lithium`

### Contribuition
Style guide:
PEP8
https://code.google.com/p/soc/wiki/PythonStyleGuide
http://www.pocoo.org/internal/styleguide/#styleguide

Add new files to list of files checked for PEP8 conformance in test/test_pep8.py in the list variable 'files_to_check'

### Test
```
$ cd spectrometer/
$ pip install -r test-requirements.txt
$ python setup.py test
```

### REST API
GET /git/commits/:modulename
GET /git/commits/:modulename/:branchname
GET /git/branches/:modulename
