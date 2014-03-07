function createMap(container, latitude, longitude){
    return new GMaps({
        div: container,
        lat: latitude,
        lng: longitude,
        height: screen.height - 300 +'px',
        width: 'inherit'
    });
}


function addMarker(map, latitude, longitude, title){
    map.addMarker({
        lat: latitude,
        lng: longitude,
        title: title,
    });
}


$('#eventHome').live('pageinit', function(){
    if (latitude === null && longitude === null){
        GMaps.geolocate({
            error: function(error) {
                $('.emptyMessage').show();
            },
            not_supported: function() {
                $('.emptyMessage').show();
            },
            success: function(position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                GMaps.geocode({
                    address: search,
                    callback: function(results, status) {
                        if (status == 'OK') {
                            map = createMap('#map', latitude, longitude);
                            if (results.length > 1){
                                map.setZoom(4);
                            }
                            for (var i = 0; i < results.length; i++){
                                var latlng = results[i].geometry.location;
                                latitude = latlng.lat();
                                longitude = latlng.lng();
                                map.setCenter(latitude, longitude);
                                addMarker(map, latitude, longitude, results[i].formatted_address);
                            }
                        }
                        else{
                            $('.icon-direction').hide();
                            $('.emptyMessage').show();
                        }
                    }
                });
            }
          });
    } else if (latitude == "1" && longitude == "1"){
        $('.icon-direction').hide();
        $('.emptyMessage').show();
    } else {
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);
        map = createMap('#map', latitude, longitude);
        map.setCenter(latitude, longitude);
        addMarker(map, latitude, longitude, room);
    }
});


$('#route').live('click', function(){
    GMaps.geolocate({
        success: function(position) {
            if (!myposition){
                myposition = [position.coords.latitude, position.coords.longitude];
                var center = [(myposition[0]+latitude)/2.0, (myposition[1]+longitude)/2.0];
                var distance = 0;
                if (myposition[0] > latitude){
                    distance = myposition[0] - latitude;
                }
                else{
                    distance = latitude - myposition[0];
                }
                if (myposition[1] > longitude){
                    if (myposition[1] - longitude > distance){
                        distance = myposition[1] - longitude;
                    }
                }
                else{
                    if (longitude - myposition[1] > distance){
                        distance = longitude - myposition[1];
                    }
                }
                zoom = 10 - Math.floor(Math.log(distance));
                map.setZoom(zoom);
                map.setCenter(center[0], center[1]);
                map.drawRoute({
                    origin: myposition,
                    destination: [latitude, longitude],
                    travelMode: 'walking',
                    strokeColor: '#131540',
                    strokeOpacity: 0.6,
                    strokeWeight: 6,
                    callback: function(e){
                        $('#routeDistance').html(map.routes[0].legs[0].distance.text);
                        $('#routeDuration').html(map.routes[0].legs[0].duration.text);
                        $('#mapTitle').css({'margin-bottom': '0px'});
                        $('#infoRoute').show();
                    }
                });
                map.addMarker({
                    lat: myposition[0],
                    lng: myposition[1],
                    title: 'You are here',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        strokeWeight: 2
                    }
                });
            }
        },
        error: function(error) {
            alert('Geolocation failed: '+error.message);
        },
        not_supported: function() {
            alert("Your browser does not support geolocation");
        }
    });
});
