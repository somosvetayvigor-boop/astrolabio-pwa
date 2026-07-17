fetch('https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=perro&format=json')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
