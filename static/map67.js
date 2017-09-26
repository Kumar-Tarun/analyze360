function draw_map(data, tdata)
{
mapboxgl.accessToken = 'pk.eyJ1IjoidGFydW5rOTgiLCJhIjoiY2ozMWp1dGtyMDAyODJxbzZ6em1wdHhjeiJ9.0wS5-BhwX7rFrekpBJqclg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/traffic-night-v2?optimize=true',
    center: [0,0],
    zoom: 2
});

map.on('load', function () {
    map.addSource("countries", {
        "type": "geojson",
        "data": "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
    });
	
   // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
    map.addSource("earthquakes", {
        "type": "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        "data":data,
	    "cluster": true,
        "clusterMaxZoom": 14, // Max zoom to cluster points on
        "clusterRadius": 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        "id": "country-fills",
        "type": "fill",
        "source": "countries",
        "layout": {},
        "paint": {
            "fill-color": "#ff5f22",
            "fill-opacity": 0
        }
    });

    map.addLayer({
        "id": "country-fills-hover",
        "type": "fill",
        "source": "countries",
        "layout": {},
        "paint": {
            "fill-color": "#D93240",
            "fill-opacity": 0.9
        },
        "filter": ["==", "ADMIN", ""]
    });

    map.addLayer({
        "id": "clusters",
        "type": "circle",
        "source": "earthquakes",
        "filter": ["has", "point_count"],
        "paint": {
            "circle-color": {
                "property": "point_count",
                "type": "interval",
                "stops": [
                    [0, "#17A697"],
                    [100, "#f1f075"],
                    [750, "#f28cb1"],
                ]
            },
            "circle-radius": {
                "property": "point_count",
                "type": "interval",
                "stops": [
                    [0, 20],
                    [100, 30],
                    [750, 40]
                ]
            }
        }
    });

    map.addLayer({
        "id": "cluster-count",
        "type": "symbol",
        "source": "earthquakes",
        "filter": ["has", "point_count"],
        "layout": {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });

    map.addLayer({
        "id": "unclustered-point",
        "type": "circle",
        "source": "earthquakes",
        "filter": ["!has", "point_count"],
        "paint": {
            "circle-color": "#17A697",
            "circle-radius": 7,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
        }
    });
    
    
    map.on('click', 'country-fills-hover', function (e) {
        if(e.features[0].properties.ADMIN in tdata) {
             new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML('<p>Country: '+e.features[0].properties.ADMIN+'</p><p>Total Tweets: '+tdata[e.features[0].properties.ADMIN][0]+'</p><p>Positive tweets: '+tdata[e.features[0].properties.ADMIN][1]+'</p><p>Neutral tweets: '+tdata[e.features[0].properties.ADMIN][2]+'</p><p>Negative tweets: '+tdata[e.features[0].properties.ADMIN][3]+'</p>')
            .addTo(map);
        }
    });

    
    // When the user moves their mouse over the states-fill layer, we'll update the filter in
    // the state-fills-hover layer to only show the matching state, thus making a hover effect.
    map.on("mousemove", "country-fills", function(e) {
        map.setFilter("country-fills-hover", ["==", "ADMIN", e.features[0].properties.ADMIN]);
    });

    // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
    map.on("mouseleave", "country-fills", function() {
        map.setFilter("country-fills-hover", ["==", "ADMIN", ""]);
    });
});
}