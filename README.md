# CS 2200 Cache Simulator
Copyright (c) 2017, Ctrl+Alt+Delicious

This application serves as an educational tool to help users visualize and understand the inner workings of a [cache](https://goo.gl/w136SD). It was primarily built to aid students taking the Introduction to Computer Systems and Networks (CS 2200) course at the Georgia Institute of Technology, but can surely act as a great resource for anyone struggling with the concept of a cache.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for usage.

### Prerequisites

This application uses Node.js and npm, installation information for Windows, MacOS, and Linux can be found [here](https://docs.npmjs.com/getting-started/installing-node).

### Installing

After installing Node and npm, go ahead and download or clone the repository [here](https://github.com/Ctrl-Alt-Delicious/CacheSimulator.git).

The first time using the application, you need to run the following command in the root directory to install all of the package dependencies:
```
npm install
```
After these have installed, start the application at any time by running the following command in the root directory:
```
npm start
```
### Usage
Watch our video demo [here](https://youtu.be/R5XCD49N-DI).

## Release Notes
#### v1.0 (2017-12-04)
* This release requires that the user install Node.js and npm and run the electron app via the source code. We had planned to release a binary executable, however we ran into some issues where trace files would not be properly uploaded when using the app in the packaged format.
	* A future plan for this is to eliminate the functionality of uploading a trace file and instead have the user select a file from a set of "built in" trace files, which would hopefully allow us to have a binary for the next release.
* Our application currently only supports simulation visualization for mock data instructions listed in `src/sim/mockSim.js` and therefore is not yet connected to the trace file uploaded by the user.
	* The idea was to store the cache states as JSON objects, and determine the visual coloring between each state by finding the "diff" of these objects. Ultimately, we ran out of time for this release to implement this correctly, however it might be able to be simplified once the built-in trace files are implemented.
* Known issues:
	* Creating a cache with 2-3 levels and then deleting one or more of these, the nav tabs at the top of the screen still show for the deleted cache levels.
	* There are some issues throughout with UI scaling, for example the address breakdown on the cache display page will sometimes overflow into the next cache level.

## Built With

* [Electron](https://electronjs.org/) - The framework used for a cross platform native application
* [AngularJS v1.5](https://angularjs.org/) - The web framework used for building the application

## Authors

* **Ricky Barillas** - [jbonzo](https://github.com/jbonzo)
* **Ryan Berst** - [ryan-berst](https://github.com/ryan-berst)
* **Eduardo Mestanza** - [emestanza3](https://github.com/emestanza3)
* **Kevin Rose** -
[kevinsrose](https://github.com/kevinsrose)
* **Will Thompson** - [wthompson40](https://github.com/wthompson40)

## Acknowledgments

* This project idea was brought to us by [Bob Waters](https://www.cc.gatech.edu/home/watersr/) who is a professor at the Georgia Institute of Technology.
