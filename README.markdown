# OpenDaylight Spectrometer

Please refer to https://opendaylight-spectrometer.readthedocs.org



### Test
```
$ cd spectrometer/
$ pip install -r test-requirements.txt
$ python setup.py test
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
