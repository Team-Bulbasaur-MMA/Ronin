function initMap() {
  const latLng = { lat: 38.9048, lng: 137.2529 };
  const myLatlng = { lat: 35.6762, lng: 139.6503 };
  const myLatlng1 = { lat: 34.6413, lng: 135.5629 };
  const myLatlng2 = { lat: 35.0116, lng: 135.5629 };
  const myLatlng3 = { lat: 34.3853, lng: 132.4553 };
  const myLatlng4 = { lat: 43.0618, lng: 141.3545 };
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: latLng
  });
  const marker = new google.maps.Marker({
    position: myLatlng,
    map,
    title: 'Click to zoom'
  });
  const marker1 = new google.maps.Marker({
    position: myLatlng1,
    map,
    title: 'Click to zoom'
  });
  const marker2 = new google.maps.Marker({
    position: myLatlng2,
    map,
    title: 'Click to zoom'
  });
  const marker3 = new google.maps.Marker({
    position: myLatlng3,
    map,
    title: 'Click to zoom'
  });
  const marker4 = new google.maps.Marker({
    position: myLatlng4,
    map,
    title: 'Click to zoom'
  });
  marker.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker.getPosition());
  });
  marker1.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker1.getPosition());
  });
  marker2.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker2.getPosition());
  });
  marker3.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker3.getPosition());
  });
  marker4.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker4.getPosition());
  });
}
