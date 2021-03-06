### Page-Loader
This package provides a program that loads the web page with its local resources into your file system.
You will be able to open it offline on your computer.

**Installation:**
1. Check if you have node.js installed (node --version). If not - install it with available package manager
2. Clone this repo
3. Install dependencies with 'make install' or 'npm ci'
4. Run npm link
5. Use page-loader -h for help with options

**Usage:** page-loader [options] URL 

**Options:**

| Option |Description  |
| :---        |    :----:   |
| -V, --version     | output the version number       |
| -0, --output [dir]   | output dir (default: process.cwd())        |
| -h, --help   | display help        |

You must provide a URL for the desirable website, Page-Loader will download this website as a .html file to output
directory. All same-level domain resources from that core .html will be downloaded into the freshly created directory
inside output directory, such as scripts, stylesheets or images. If an error occurs during local resources download 
it will be skipped but the program won't shut down.

### Hexlet tests and linter status:
[![Actions Status](https://github.com/nidges/backend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/nidges/backend-project-lvl3/actions)

### CodeClimate
[![Maintainability](https://api.codeclimate.com/v1/badges/233dd82edbb1a665cd06/maintainability)](https://codeclimate.com/github/nidges/backend-project-lvl3/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/233dd82edbb1a665cd06/test_coverage)](https://codeclimate.com/github/nidges/backend-project-lvl3/test_coverage)

### GitHub Actions
[![my workflow](https://github.com/nidges/backend-project-lvl3/actions/workflows/my-workflow.yml/badge.svg?event=push)](https://github.com/nidges/backend-project-lvl3/actions/workflows/my-workflow.yml)

### Page Loader - downloading HTML file for given URL
[![asciicast](https://asciinema.org/a/SA6aoZtr2AruNBvLGm2QaJcvl.svg)](https://asciinema.org/a/SA6aoZtr2AruNBvLGm2QaJcvl)

### Page Loader - downloading core HTML, inner pics, creating folder
[![asciicast](https://asciinema.org/a/0bCA2f0OdqSS0gajM4XlzD1qX.svg)](https://asciinema.org/a/0bCA2f0OdqSS0gajM4XlzD1qX)

### Page Loader - downloading core HTML and all page resources, which go into folder
[![asciicast](https://asciinema.org/a/ADLgDf4UTKjjcJ7eZfEvBrgJw.svg)](https://asciinema.org/a/ADLgDf4UTKjjcJ7eZfEvBrgJw)

### Page Loader - logger example
[![asciicast](https://asciinema.org/a/fKK6l7AVwDC4SaeGWqXWhLULs.svg)](https://asciinema.org/a/fKK6l7AVwDC4SaeGWqXWhLULs)

### Page Loader - error handling example
[![asciicast](https://asciinema.org/a/oNBFtXlCMdYDTO5GKeL8GlZTw.svg)](https://asciinema.org/a/oNBFtXlCMdYDTO5GKeL8GlZTw)

### Page Loader - progress visualisation
[![asciicast](https://asciinema.org/a/PKnwJCOWt35VqOZKZ8pLDZEsU.svg)](https://asciinema.org/a/PKnwJCOWt35VqOZKZ8pLDZEsU)
