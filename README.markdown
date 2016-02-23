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
with the following format:
```
modulename:
  repo: path/to/bare_repo/directory
```
Now the flask application must be up and serve requests:
```
$ python spectrometer-server
```
Now `http://127.0.0.1:5000/git/commits/:modulename` will return repository log of added repository address in *yaml*
file.

`http://127.0.0.1:5000/git/commits/:modulename/:branchname` will return commits on that branch and parents commits to
them that are not in `master` branch. An example can be `http://127.0.0.1:5000/git/commits/aaa/stable/lithium`

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
```
GET /git/commits/:modulename
```

List of commits in *master* branch.

```
GET /git/commits/:modulename/:branchname
```

List of commits in *branchname* and their ancestors excluding those in *master* branch.

```
{
  "commits": [
    {
      "commiter": "Ryan Goulding",
      "email": "@gmail.com",
      "hash": "f6c87f3cd7eaa6ffc32625546828a2b6cd42722e",
      "lines": {
        "deletions": 0,
        "files": 4,
        "insertions": 275,
        "lines": 275
      },
      "time": "05 Feb 2016 23:27"
    },
    ...
    ]
}
```

```
{
  "error": "Branch stable/f was not found!"
}
```

```
GET /git/branches/:modulename
```

List of branches in the repository *modulename*.

```
{
  "names": [
    "master",
    "pre-boron",
    "stable/beryllium",
    "stable/helium",
    "stable/lithium"
  ]
}
```

```
GET /git/author/loc/:author_email/:module_name/
```

Name of the author, Total lines of code contributed, Total number of commits.

```
{
  "commit_count": 28,
  "loc": 1304,
  "name": "Thanh Ha"
}
```

```
GET /git/author/loc/:author_email/:module_name/:branch_name
```

Name of the author, total lines of code contributed, and total number of commits on a certain branch.


```
GET /git/authors/:module_name
GET /git/authors/:module_name/:branch_name
```

List of authors.

```
{
  "authors": [
    [
      "Ryan Goulding",
      "...@gmail.com"
    ],
    [
      "Sai MarapaReddy",
      "...@brocade.com"
    ]
  ]
}
```

```
GET /gerrit/projects
```

List of projects in Gerrit.

```
{
  "projects": [
    "groupbasedpolicy",
    "spectrometer",
    "releng/autorelease",
    "snmp4sdn",
    "ovsdb",
    "nemo",
    ...
    ]
}
```