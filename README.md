<h1>Js<span class="jsondiffpatch-textdiff-deleted" style="background:#fbb;text-decoration:line-through;"><span>on</span></span><span class="jsondiffpatch-textdiff-added" style="background:#bfb"><span>Diff</span></span>Patch</h1>
<!--- badges -->
[![Build Status](https://secure.travis-ci.org/benjamine/JsonDiffPatch.png)](http://travis-ci.org/benjamine/JsonDiffPatch)
[![NPM version](https://badge.fury.io/js/jsondiffpatch.png)](http://badge.fury.io/js/jsondiffpatch)
[![Bower version](https://badge.fury.io/bo/jsondiffpatch.png)](http://badge.fury.io/bo/jsondiffpatch)

Diff & patch JavaScript objects

-----
**[Live Demo](http://benjamine.github.com/JsonDiffPatch/demo/index.html)**
-----

- min+gzipped < 6KB
- browser (```/build/bundle.js```) and server (eg. node.js)
- includes [google-diff-match-patch](http://code.google.com/p/google-diff-match-patch/) for long text diffs (diff at characther level)
- smart array diffing using [LCS](http://en.wikipedia.org/wiki/Longest_common_subsequence_problem), ***IMPORTANT NOTE:*** to match objects inside an array you ***must*** provide an ```objectHash``` function, check [Array diff documentation](docs/arrays.md)
- reverse a delta
- unpatch (eg. revert object to its original state using a delta)
- simplistic, pure JSON, low footprint [delta format](docs/formatters.md)
- multiple output formatters:
    - html (check it at the [Live Demo](http://benjamine.github.com/JsonDiffPatch/demo/index.html))
    - annotated json (html), makes the JSON delta forma self-explained
    - console (colored), try running ```./node_modules/.bin/jsondiffpatch left.json right.json```
    - write your own! check [Formatters documentation](docs/formatters.md)

Usage
-----

``` javascript
    // sample data
    var country = {
        name: "Argentina",
        capital: "Buenos Aires",
        independence: new Date(1816, 6, 9),
        unasur: true
    };

    // clone country, using dateReviver for Date objects
    var country2 = JSON.parse(JSON.stringify(country), jsondiffpatch.dateReviver);

    // make some changes
    country2.name = "Republica Argentina";
    country2.population = 41324992;
    delete country2.capital;

    var delta = jsondiffpatch.diff(country, country2);

    assertSame(delta, {
        "name":["Argentina","Republica Argentina"], // old value, new value
        "population":["41324992"], // new value
        "capital":["Buenos Aires", 0, 0] // deleted
    });

    // patch original
    jsondiffpatch.patch(country, delta);

    // reverse diff
    var reverseDelta = jsondiffpatch.reverse(delta);
    // also country2 can be return to original value with: jsondiffpatch.unpatch(country2, delta);

    var delta2 = jsondiffpatch.diff(country, country2);
    assert(delta2 === undefined)
    // undefined => no difference
```

Array diffing:

``` javascript
    // sample data
    var country = {
        name: "Argentina",
        cities: [
        {
            name: 'Buenos Aires',
            population: 13028000,
        },
        {
            name: 'Cordoba',
            population: 1430023,
        },
        {
            name: 'Rosario',
            population: 1136286,
        },
        {
            name: 'Mendoza',
            population: 901126,
        },
        {
            name: 'San Miguel de Tucuman',
            population: 800000,
        }
        ]
    };

    // clone country
    var country2 = JSON.parse(JSON.stringify(country));

    // delete Cordoba
    country.cities.splice(1, 1);

    // add La Plata
    country.cities.splice(4, 0, {
        name: 'La Plata'
        });

    // modify Rosario, and move it
    var rosario = country.cities.splice(1, 1)[0];
    rosario.population += 1234;
    country.cities.push(rosario);

    // create a configured instance, match objects by name
    var diffpatcher = jsondiffpatch.create({
        objectHash: function(obj) {
            return obj.name;
        }
    });

    var delta = jsondiffpatch.diff(country, country2);

    assertSame(delta, {
        "cities": {
            "_t": "a", // indicates this node is an array (not an object)
            "1": [
                // inserted at index 1
                {
                    "name": "Cordoba",
                    "population": 1430023
                }]
            ,
            "2": {
                // population modified at index 2 (Rosario)
                "population": [
                    1137520,
                    1136286
                ]
            },
            "_3": [
                // removed from index 3
                {
                    "name": "La Plata"
                }, 0, 0],
            "_4": [
                // move from index 4 to index 2
                '', 2, 3]
        }
    });
```

For more example cases (nested objects or arrays, long text diffs) check ```test/examples/```

If you want to understand deltas, see [delta format documentation](docs/formatters.md)

Targeted platforms
----------------

* Any modern browser and IE8+. Firefox is tested on CI, you can test your current browser visiting [test page](http://benjamine.github.com/JsonDiffPatch/test/index.html).
* Node.js, tested on CI

To run tests locally:

``` sh
    npm i
    # will test in node.js and phantomjs (headless browser)
    npm test

    # or test on specific browsers (using karma.js)
    BROWSERS=chrome,phantomjs npm test
```

Installing
---------------

### npm (node.js)

``` sh
npm install jsondiffpatch
```

``` js
var jsondiffpatch = require('jsondiffpatch').create(options);
```

### bower (browser)

``` sh
bower install jsondiffpatch
```

brower bundles are in the ```/build``` folder (run ```make``` or ```gulp``` to generate these):
- bundle.js main bundle
- bundle.full.js includes [google-diff-match-patch](http://code.google.com/p/google-diff-match-patch/) library for text diffs
- formatters.js includes builtin formatters (only those useful in a browser)

(all these include minified versions)

Visual Diff
----------------

``` html
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="build/bundle.min.js"></script>
        <script type="text/javascript" src="build/formatters.min.js"></script>
        <link rel="stylesheet" href="src/formatters/html.css" type="text/css" />
        <link rel="stylesheet" href="src/formatters/annotated.css" type="text/css" />
    </head>
    <body>
        <div id="visual"></div>
        <hr/>
        <div id="annotated"></div>
        <script>
            var left = { a: 3, b: 4 };
            var right = { a: 5, c: 9 };
            var delta = jsondiffpatch.diff(left, right);

            // beautiful html diff
            document.getElementById('visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);

            // self-explained json
            document.getElementById('annotated').innerHTML = jsondiffpatch.formatters.annotated.format(delta, left);
        </script>
    </body>
</html>
```

To see formatters in action check the [Live Demo](http://benjamine.github.com/JsonDiffPatch/demo/index.html).

For more details check [Formatters documentation](docs/formatters.md)

Console
--------

``` sh
# diff two json files, colored output (using chalk lib)
./node_modules/.bin/jsondiffpatch ./left.json ./right.json

# or install globally
npm install -g jsondiffpatch

jsondiffpatch ./demo/left.json ./demo/right.json
```

![console_demo!](demo/consoledemo.png)

Plugins
-------

```diff()```, ```patch()``` and ```reverse()``` functions are implemented using a pipes &filters pattern, making it extremely customizable by adding or replacing filters on a pipe.

Check [Plugins documentation](docs/formatters.md) for more info.