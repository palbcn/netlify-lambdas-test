(function () {
  /**
     whenReady invokes a callback when DOM is ready (fully loaded)
     
     @arg fn function to be invoked when DOM Content is ready
     
  */
  function whenReady(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /**
     showDebug -- send debug information both to console and to #debug page element
     
     @arguments all arguments passed along to both console and debug page element
     
  */
  function showDebug() {
    let n = new Date().toLocaleTimeString("en-GB").slice(0, 8);
    console.log(...arguments);
    document.querySelector("#debug")
      .insertAdjacentHTML('afterbegin',
        `<p>${n} ${Array.from(arguments).join(" ")}</p>`);
  };

  /**
     getJson -- AJAX call, fetches a JSON file thru XHR GET
     
     @arg url the json url to get
     @arg cb  callback(err,json) when completed
     
  */
  function getJson(url, cb) {
    let request = new XMLHttpRequest();
    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        let data = JSON.parse(this.response);
        cb(null, data);
      } else {
        // We reached our target server, but it returned an error
        cb(new Error(this.statusText), null);
      }
    }
    request.onerror = function () {
      // There was a connection error of some sort
      cb(new Error("Connection error"), null);
    };
    request.open('GET', url, true);
    request.setRequestHeader("accept", "application/json");
    request.send();
  };


  function ping() {
    showDebug("ping", Math.random());
  }

  whenReady(function () {

    //showDebug("ready");

    getJson(".netlify/functions/citas", function (err, data) {
      let content = data.cita;
      document.getElementById("result").innerHTML = `<p>${content}</p>`
    });

    //setInterval( ping, 5000);   

  });

})(); 
