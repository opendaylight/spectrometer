# OpenDaylight Spectrometer

The Spectrometer project consists of two sub-projects, the ```server``` and ```web```.

Server side is Python driven and provides the API to collect Git and Gerrit statistics for various OpenDaylight projects.

The web project is NodeJS/React based and provides the visualization by using the APIs provided by the server side.

In order to run the application, you need to install both ```server``` and ```web``` sub-projects.

## Quick Getting Started Guide

The Quick Getting Started Guide assumes you have Python 2.7 (or Python3 ) and NodeJS 4.3 installed. To install NodeJS using NVM, see Web > Installation section below.

The Spectrometer project collects data from repositories located locally in your system.
Create a directory called ~/odl-spectrometer (mandatory) and within that create softlinks to all your local ODL repos.
The Spectrometer server loads data from the softlinks located in ~/odl-spectrometer.

```
$ mkdir ~/odl-spectrometer
$ ln -sf <location-of-opendaylight-project> <project-name>  # eg. ln -sf ~/odl-git-repos/aaa aaa
$ cd ~    # or any folder where you want to checkout spectrometer
$ git clone ssh://<user>@git.opendaylight.org:29418/spectrometer.git
$ cd spectrometer/server
$ pip install -r requirements.txt
$ python spectrometer-server
$ cd ../web
$ npm i
$ npm start
```

Goto ```http://localhost:8000```

## Server
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

## Web

### Installation

To install NodeJS in your system, use the Node Version Manager (NVM), which allows to co-exist multiple
NodeJS versions in the same system.

If you already have NodeJS older versions (<= 0.12), it is strongly recommended to completely remove them and reinstall using NVM.

For Linux systems, you can do the following to remove NodeJS:

```
$ which node # Note down the path
$ sudo rm -r /path/bin/node /path/bin/npm /path/include/node /path/lib/node_modules ~/.npm
```

Install NVM, NodeJS 4.3.x and NPM

```
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
$ nvm install 4.3.1  # By default this installs npm 2.14.x
$ npm install npm -g # This will upgrade npm to 3.7.x
```

### Run

```
$ cd ~/spectrometer/web
$ npm install
$ npm start
```

Goto  ```http://localhost:8000```

The web project is configured to hot-reload when any changes are made to the code. Most of the time the web browser should auto refresh, if not simply refresh the page.

### UI Technology Stack

* NodeJS 4.3 - Bootstrapping and Universal (isomorphic) Javascript execution
* ExpressJS - Web-server-side bootstrap for UI
* ReactJS 0.14 - View Layer
* Redux - Data and State management (Flux pattern)
* Webpack - Build tool
* Babel - Asset compilation, ES6 Transpiler
* FormidableLabs VictoryChart - D3-based React components
* Redux Dev Tools - Tool that allows to track state management


### Production

Production build does not have Devtools and hot reloading middleware. It also minifies scripts and css.

For Production build, execute the following commands:

```
$ npm run build
$ npm run start-prod
```

### Run Test

Unit Tests are executed using Mocha and Chai assert libraries.

```
npm test
```

### Troubleshooting

#### Adding new repository

In order to add a new repository to collect statistics, you must make the following changes:

1. Create a soft link in ~/odl-spectrometer to the new repository
1. Edit the server/spectrometer/etc/repositories.yaml and specify the key and path to ~/odl-spectrometer/$repo
1. Edit the web/src/config.json add the project name in the list (this makes it appear in the dropdown)
1. Reload the web page
1. If reload web page does not work, restart python ```python spectrometer-server``` and web ```npm start```)

### Roadmap

1. Dynamic loading of repositories as opposed to loading via config.json

## Credit

App template was based on [Lanyon Theme](https://github.com/poole/lanyon) by [mdo](https://github.com/mdo)
