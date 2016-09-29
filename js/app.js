var locations = [{
    title: "Caroline Springs",
    latitude: -37.745,
    longitude: 144.74
}, {
    title: "Royal Botanic Gardens",
    latitude: -37.8304,
    longitude: 144.9796
}, {
    title: "Queen Victoria Market",
    latitude: -37.8076,
    longitude: 144.9568
}, {
    title: "Federation Square",
    latitude: -37.8180,
    longitude: 144.9691
}, {
    title: "Melbourne Airport",
    latitude: -37.6690,
    longitude: 144.8410
}];
var locdisplay = [];
var markers = [];
var map;

//Access four square API to display additional information about locations.

var getApi = function(marker) {

    var $windowContent = $('#content');
    var lat = marker.position.lat();
    var lon = marker.position.lng();


    // the foursquare api url
    var url = 'https://api.foursquare.com/v2/venues/search?client_id=' +
        'VHGPTJAHMQJO0WZCY3O1YSSURJHFYZVAWD1ET3Q1ZKX1MKYL' +
        '&client_secret=YXF1YBMF1GYDPEBAKRIZ5YFFGR1DN2MH1PWCS1VRFHISYWMX' +
        '&v=20130815' + '&ll=' + lat + ',' +
        lon + '&query=\'' + marker.title + '\'&limit=1';

    $.getJSON(url, function(response) {

        //place the data returned in variables and append this data to the info window

        var venue = response.response.venues[0];
        var venuePhone = venue.contact.formattedPhone;
        var venueAddress = venue.location.formattedAddress;

        if (venuePhone) {
            $windowContent.append('<p>' + venuePhone + '</p>');
        } else {
            $windowContent.append('<p> Phone number not found</p>');
        }

        if (venueAddress) {
            $windowContent.append('<p>' + venueAddress + '</p>');
        } else {
            $windowContent.append('<p> Address not found </p>');
        }


    }).error(function(e) {
        $windowContent.text('Content could not be loaded');

    });

};




var ViewModel = function() {

    var self = this;
    this.itemToSearch = ko.observable("");
    self.loclist = ko.observableArray([]);
    if (this.itemToSearch() == "") {
        locdisplay = locations;
        self.loclist(locations);
    }

    this.addSearch = function() {
        locdisplay = [];
        self.loclist([]);

        if (this.itemToSearch() != "") {
            for (var i = 0; i < 5; i++) {
                var loctitle = locations[i].title;
                if (loctitle.includes(this.itemToSearch())) {
                    locdisplay.push(locations[i]);
                    self.loclist.push(locations[i]);
                }
            }


            initMap();



        }

    }.bind(this);

    this.determineLocationClicked = function(clickedloc) {
        var infowin = new google.maps.InfoWindow();
        for (i = 0; i < markers.length; i++) {
            if (clickedloc.title == markers[i].title) {
                if (markers[i].getAnimation() !== null) {
                    markers[i].setAnimation(null);
                } else {
                    markers[i].setAnimation(google.maps.Animation.BOUNCE);
                    infowin.setContent(markers[i].title + "<div id='content'></div>");
                    infowin.open(mapcanvas, markers[i]);
                    getApi(markers[i]);
                }
            }
        }
    };

};

ko.applyBindings(new ViewModel());




function initMap() {
    var infowindow = new google.maps.InfoWindow();
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('mapcanvas'), {
        center: {
            lat: -37.8136,
            lng: 144.9631
        },
        scrollwheel: false,
        zoom: 10
    });
    window.mapBounds = new google.maps.LatLngBounds({
        lat: -37.9,
        lng: 144.65
    }, {
        lat: -37.5,
        lng: 144.95
    });
    map.fitBounds(mapBounds);


    var loclength = locdisplay.length;



    for (var i = 0; i < loclength; i++) {
        var myLatlng = new google.maps.LatLng(locdisplay[i].latitude, locdisplay[i].longitude);
        var marker = new google.maps.Marker({
            position: myLatlng,
            title: locdisplay[i].title
        });
        marker.setMap(map);
        markers[i] = marker;

        marker.addListener('click', (function(markercopy) {
            return function() {
                if (markercopy.getAnimation() !== null) {
                    markercopy.setAnimation(null);
                } else {
                    markercopy.setAnimation(google.maps.Animation.BOUNCE);
                    infowindow.setContent(markercopy.title + "<div id='content'></div>");
                    infowindow.open(map, markercopy);
                    getApi(markercopy);
                }
            };
        })(marker));

    }
    window.addEventListener('resize', function(e) {
        map.fitBounds(mapBounds);
    });

}

function googleError() {
    alert("Error on loading google map");
}

$("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    }); 