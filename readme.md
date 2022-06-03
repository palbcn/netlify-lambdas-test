# netlify lambda functions

based on the 
https://flaviocopes.com/netlify-functions/ tutorial
and completed with some guai examples.

## setup

create a `project` directory
initialize a `package.json` with

   npm init -y

edit `package.json` and add `"type":"module"`

create a git repo and a remote _github_ repo

register in netlify and create a _netlify_ site with automated deploy from your _github_ repo

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

    start netlify dev

or just a local functions dev server (which might be more agile, without the overload of serving and watching html content)

    start netlify functions:serve


and then visit

    http://localhost:9999/.netlify/functions/test



## local debug

if you want to debug your function code, we need to start the server in inspection mode, and start a debugger. 

The next instructions are for using **vscode**.

Create a new `"configurations":` entry in your `.vscode/launch.json`

    {
      "name": "Launch Netlify",
      "type": "pwa-node",
      "request": "launch",
      "runtimeArgs": [
        "--inspect"
      ],
      "program": "${workspaceFolder}\\node_modules\\netlify-cli\\bin\\run",
      "args": [
        "functions:serve"
      ],
      "skipFiles": [
        "<node_internals>/**"
      ],
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**"
      ]
    }

now you can launch this configuration with breakpoints in your functions code.


## deploy

commit your changes to git and push them to your remote repo

    git commit -a -m "commit message"
    git push
    
you can now point your browser to your netlify site and see the deployed web and functions

`https://citas-celebres-ji.netlify.app/.netlify/functions/citas`


## test




