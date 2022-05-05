# netlify lambda functions

based on the 
https://flaviocopes.com/netlify-functions/ tutorial
and completed with some guai examples.

## setup

create a `project` directory
with a `package.json` with added `"type":"module"`

create local git repository with `git init` and a remote repo in _github_

create a _netlify_ site with automated deploy from the _github_ repo

and install the local netlify `npm --global install netlify-cli`


## develop

create a directory `functions` 

a js file `functions/test.js` with

```
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Hello world ${Math.floor(Math.random() * 10)}` })
  };
}
```

and a `netlify.toml` in the root, that should point the functions route to the `./functions` directory

```
[build]
functions = "./functions"
```


## local test 

to test your new function you need to start a server

either start a local dev server

    netlify dev

or just a local functions dev server (which might be more agile, without the overload of serving and watching html content)

    netlify functions:serve


and then visit

    http://localhost:9999/.netlify/functions/test



## local debug

if you want to debug your function code, we need to start the server in inspection mode, and start a debugger. The next instructions are for using vscode.

So, prepare `package.json` with a new entry in `"scripts":` 

    "debug": "netlify functions:serve --inspect",

and a new `"configurations":` entry in your `launch.json`

    {
      "name": "Launch Netlify",
      "type": "pwa-node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run-script", "debug"],
      "skipFiles": ["<node_internals>/**"]
    }

now you can launch this configuration with breakpoints in your functions code.


## deploy

## test

