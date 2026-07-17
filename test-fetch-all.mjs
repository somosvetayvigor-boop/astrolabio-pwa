const key = 'AIzaSyBO5xT-w7TI_DhVXe5B52sDt6dCXVsJiGQ';
async function run() {
  let url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  let hasNext = true;
  while (hasNext) {
    const res = await fetch(url);
    const data = await res.json();
    data.models.forEach(m => console.log(m.name));
    if (data.nextPageToken) {
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageToken=${data.nextPageToken}`;
    } else {
      hasNext = false;
    }
  }
}
run().catch(console.error);
