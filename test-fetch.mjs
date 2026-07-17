const key = 'AIzaSyBO5xT-w7TI_DhVXe5B52sDt6dCXVsJiGQ';
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
