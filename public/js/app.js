function initMap() {
  const myLatlng = { lat: -25.363, lng: 131.044 };
  const myLatlng1 = { lat: -25.101, lng: 131.044 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: myLatlng
  });
  const marker = new google.maps.Marker({
    position: myLatlng,
    map,
    title: "Click to zoom"
  });
  const marker1 = new google.maps.Marker({
    position: myLatlng1,
    map,
    title: "Click to zoom"
  });
  marker.addListener("click", () => {
    map.setZoom(8);
    map.setCenter(marker.getPosition());
  });
  marker1.addListener("click", () => {
    map.setZoom(8);
    map.setCenter(marker1.getPosition());
  });
}
