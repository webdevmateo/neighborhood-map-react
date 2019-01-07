import React, { Component } from 'react';
import LocationsList from './components/locations';
import Map from './components/mapDisplay';
import './App.css';
import {getGoogleMaps, getPlaces, toggleDrawer, closeDrawer} from './utils';

class App extends Component {

  state = {
    query: '',
    filtered: [],
    lat: 34.15334,
    lng: -118.761676,
  }

  componentDidMount = () => {
    let googleMapsPromise = getGoogleMaps();
    let placesPromise = getPlaces(this.state.lat, this.state.lng);

    Promise.all([
      googleMapsPromise,
      placesPromise
      ])
      .then((values) => {
        let google = values[0];
        let places = values[1].response.groups[0].items;
        let venues = [];
        places.forEach((place) => {
          const venue = place.venue;
          venues.push(venue);
        })
        this.venues = venues;
        this.google = google;
        this.markers = [];
        this.infowindow = new google.maps.InfoWindow();
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: {
            lat: this.state.lat,
            lng: this.state.lng
          }
        });
        venues.forEach((venue) => {
          const marker = new google.maps.Marker({
            map: this.map,
            position: {lat: venue.location.lat, lng: venue.location.lng},
            title: venue.name,
            animation: window.google.maps.Animation.DROP,
            id: venue.id,
        });
      // Push the marker to our array of markers.
        this.markers.push(marker);
        marker.addListener('click', () => {
          this.populateInfoWindow(marker, this.infowindow);
        });
        });
        this.setState({
          filtered: venues,
        })
      })
      .catch((error) => alert('There was an error loading the page.'));
  }

  filterLocations = (query) => {
    let filtered;
    if (query) {
      filtered = this.venues.filter((location) => location.name.toLowerCase().includes(query.toLowerCase()));
    } else {
      filtered = this.venues;
    }

    this.markers.forEach((marker) => {
      if (marker.title.toLowerCase().includes(query.toLowerCase())) {
        marker.setMap(this.map);
      } else {
        marker.setMap(null);
      }
    });

    this.setState({
      filtered,
      query
    });
  }


  populateInfoWindow = (marker, infowindow) => {

    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
      // Clear the infowindow content to give the streetview time to load.
      const location = this.state.filtered.filter((location) => location.id === marker.id)[0];

      infowindow.setContent(`
                              <h3>${location.name}</h3>
                              <div>${location.location.formattedAddress[0]}</div>
                              <div>${location.location.formattedAddress[1]}</div>
                              <div>${location.location.formattedAddress[2]}</div>
                              <p><em>Locations provided by FourSquare</em></p>
                            `);
      infowindow.marker = marker;

      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', () => {
        infowindow.marker = null;
        marker.setAnimation(-1);
      });

      this.map.addListener('click', () => {
        infowindow.close();
        infowindow.marker = null;
        marker.setAnimation(-1);
      })

      // Open the infowindow on the correct marker.
      infowindow.open(this.map, marker);
    }
  }

  onListItemClick = (id) => {
    let markers = this.markers;
    let filtered = markers.filter((marker) => marker.id === id)[0];

    this.populateInfoWindow(filtered, this.infowindow);
    filtered.setAnimation(window.google.maps.Animation.BOUNCE);
    setTimeout(() => {filtered.setAnimation(-1)}, 725);
    closeDrawer();
  }

  render() {
    return (
      <div className="App">
        <h1 className="title">Around the Neighborhood</h1>
        <h4 className="subtitle">Things to do in Agoura Hills, California</h4>
        <LocationsList
          query={this.state.query}
          filtered={this.state.filtered}
          filterLocations={this.filterLocations}
          onListItemClick={this.onListItemClick}
          toggleDrawer={toggleDrawer}
        />
        <Map
          closeDrawer={closeDrawer}
        />
      </div>
    );
  }
}

export default App;
