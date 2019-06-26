export const fetchFlickrImages = (query) => {
  let target = document.getElementById('images');
  let h = document.createElement("H1");
  let h2 = document.createElement("H2");

  const request = `https://api.flickr.com/services/rest/?
&api_key=fc8f124edbb182e76d182b6af9727cd2
&method=flickr.photos.search
&format=json&nojsoncallback=1
&per_page=10
&tag_mode=all
&tags=${query}%2C+colinas%2C+da%2C+anhanguera`;

  fetch(request)
    .then(response => response.json())
    .then((data) => {

      if(data.photos.total<1){
        h2.innerHTML+='Ainda não há imagem disponivel no Flickr deste local';
        target.appendChild(h2);
      }

      data.photos.photo.forEach(({ farm, server, id, secret, title }) => {
        let a = document.createElement("a")
        let img = document.createElement("img");
        img.src = `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`
        img.setAttribute("alt", `Image tile:${title}`)
        a.setAttribute("href", img.src)
        a.appendChild(img)
        target.appendChild(a)
      });
    })
    .catch(error => {
    h.innerHTML+='Sem conexão ou sem resposta do Flickr';
    target.appendChild(h);
    console.warn(error) })
}
