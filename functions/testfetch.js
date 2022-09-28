import fetch from 'node-fetch';

(async function () {
  try {
    let rsp = await fetch('https://jsonplaceholder.typicode.com/users/1');
    let post = await rsp.json();
    console.log(post);
  } catch (e) {
    console.error(e);
  }
})()