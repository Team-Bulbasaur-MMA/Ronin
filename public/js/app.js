'use strict';

const users = document.getElementById('users')
let string = users.textContent;

function initMap() {
  const latLng = { lat: 38.9048, lng: 137.2529 };
  const tokyo = { lat: 35.6762, lng: 139.6503 };
  const osako = { lat: 34.6413, lng: 135.5629 };
  const kyoto = { lat: 35.0116, lng: 135.5629 };
  const hiroshima = { lat: 34.3853, lng: 132.4553 };
  const sapporo = { lat: 43.0618, lng: 141.3545 };
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: latLng
  });
  const marker = new google.maps.Marker({
    position: tokyo,
    map,
    title: 'Tokyo'
  });
  const marker1 = new google.maps.Marker({
    position: osako,
    map,
    title: 'Osaka'
  });
  const marker2 = new google.maps.Marker({
    position: kyoto,
    map,
    title: 'Kyoto'
  });
  const marker3 = new google.maps.Marker({
    position: hiroshima,
    map,
    title: 'Hiroshima'
  });
  const marker4 = new google.maps.Marker({
    position: sapporo,
    map,
    title: 'Sapporo'
  });
  marker.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker.getPosition());
    console.log(marker);
    const title = marker.title;
    const lat = marker.getPosition().lat();
    const lng = marker.getPosition().lng();
    let url = `http://localhost:3000/location/${title}/${lat}/${lng}?user_name=${string}`;
    // let url = `http://www.ronin-travelez.xyz/location/${title}/${lat}/${lng}?user_name=${string}`;
    window.location=url;
  });
  marker1.addListener('click', () => {
    console.log('CLicked Osaka');
    map.setZoom(10.5);
    map.setCenter(marker1.getPosition());
    const title = marker1.title;
    const lat = marker1.getPosition().lat();
    const lng = marker1.getPosition().lng();
    let url = `http://localhost:3000/location/${title}/${lat}/${lng}?user_name=${string}`;
    // let url = `http://www.ronin-travelez.xyz/location/${title}/${lat}/${lng}?user_name=${string}`;
    window.location=url;
  });
  marker2.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker2.getPosition());
    const title = marker2.title;
    const lat = marker2.getPosition().lat();
    const lng = marker2.getPosition().lng();
    let url = `http://localhost:3000/location/${title}/${lat}/${lng}?user_name=${string}`;
    // let url = `http://www.ronin-travelez.xyz/location/${title}/${lat}/${lng}?user_name=${string}`;
    window.location=url;
  });
  marker3.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker3.getPosition());
    const title = marker3.title;
    const lat = marker3.getPosition().lat();
    const lng = marker3.getPosition().lng();
    let url = `http://localhost:3000/location/${title}/${lat}/${lng}?user_name=${string}`;
    // let url = `http://www.ronin-travelez.xyz/location/${title}/${lat}/${lng}?user_name=${string}`;
    window.location=url;
  });
  marker4.addListener('click', () => {
    map.setZoom(10.5);
    map.setCenter(marker4.getPosition());
    const title = marker4.title;
    const lat = marker4.getPosition().lat();
    const lng = marker4.getPosition().lng();
    let url = `http://localhost:3000/location/${title}/${lat}/${lng}?user_name=${string}`;
    // let url = `http://www.ronin-travelez.xyz/location/${title}/${lat}/${lng}?user_name=${string}`;
    window.location=url;
  });
}

