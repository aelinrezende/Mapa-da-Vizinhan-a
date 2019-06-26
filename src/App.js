// eslint-disable-next-line
import React, { Component } from 'react';
import './App.css';
import List from './List';
import Modal from './Modal';
import * as FlickrApi from './FlickrApi';
import cityLocations from './Locations.json';
import positionIcon from './icons/gps.png';
import escapeRegExp from 'escape-string-regexp'

//  Google Maps init
let markers = []
let marker = ''
let infowindows = []
let map = "";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      workingList: [],
      infowindow: null,
      infowindows: [],
      map: "",
      markers: [],
      isVisible: false,
      query: '',
      modalTitle: '',
      marker: [],
      searchHidden: window.innerWidth > 600 ? false : window.innerWidth < 600 ? true : null,
      bounds: {}
    }
    this.drawMap = this.drawMap.bind(this)
    this.updateQuery = this.updateQuery.bind(this)
    this.openModal = this.openModal.bind(this)
    this.modalClosed = this.modalClosed.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.toggleSearch = this.toggleSearch.bind(this)
    this.screenListener = this.screenListener.bind(this)
    this.errMsg = this.errMsg.bind(this)
    this.loadJS = this.loadJS.bind(this)
  }


  componentDidMount() {

    window.drawMap = this.drawMap;
    this.loadJS(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCc-tLivAeuGihzxC4liRDopI-hbawTg4Y&callback=drawMap"
    );

    this.screenListener()
    if (!navigator.onLine)
      this.errMsg()
  }

  loadJS(src) {
    let ref = window.document.getElementsByTagName("script")[0];
    let script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = this.errMsg
    ref.parentNode.insertBefore(script, ref);
  }

  drawMap() {
    let myCity = new window.google.maps.LatLng(-23.4529569, -46.875048)

    let map = new window.google.maps.Map(document.getElementById('map'), {
      center: myCity,
      zoom: 13,
      mapTypeId: 'roadmap',
    })

    this.setState({ map: map })

    let bounds = new window.google.maps.LatLngBounds()

    for (let i = 0; i < cityLocations.length; i++) {
      let position = cityLocations[i].location;
      let title = cityLocations[i].name;
      let id = cityLocations[i].id
      let marker = new window.google.maps.Marker({
        map: map,
        position: position,
        title: title,
        icon: positionIcon,
        id: id
      });
      markers.push(marker);

      var infowindow = new window.google.maps.InfoWindow({
        map: map,
        title: title,
        id: id,
        maxWidth: 200
      });
      let self = this
      marker.openInfoWindow = function () {
        let content =
          `<div id='info'>
        <div><strong><h1>${marker.title}</h1></strong></div>
        <div><strong><p>Click for pictures</p></strong></div>
        </div>
        `
        if (infowindow) infowindow.close();
        infowindow = new window.google.maps.InfoWindow({ content: content });
        infowindow.open(map, marker);
        window.google.maps.event.addListener(infowindow, 'domready', function () {
          self.openModal()
        });
        self.setState({ modalTitle: title })
        self.setState({ infowindow: infowindow })
      };
      window.google.maps.event.addListener(marker, "click", marker.openInfoWindow);
      window.google.maps.event.addListener(marker, "click", function () {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(function () {
          marker.setAnimation(null);
        }, 800);
      });

      bounds.extend(markers[i].position);
      this.setState({ locations: cityLocations, workingList: cityLocations, infowindows: infowindows, markers: markers, bounds: bounds })
    }
    map.fitBounds(bounds);
  }

  errMsg() {
    let root = document.getElementById('map');
    let divMsg = document.createElement('DIV');
    divMsg.innerHTML = `<div class="error">Google Maps failed to load!</div>`
    root.prepend(divMsg)
  }

  openModal(infowindow) {
    let self = this
    let info = document.getElementById("info")
    window.google.maps.event.addDomListener(info, 'click', function () {
      self.setState({ isVisible: true })
      FlickrApi.fetchFlickrImages(self.state.modalTitle)
    })
  }

  modalClosed(map, marker) {
    this.setState({ isVisible: false })
    this.state.infowindow.close(map, marker)
  }

  updateQuery(query, infowindow) {
    let workingList = this.state.workingList
    let locations = this.state.locations
    let markers = this.state.markers
    this.setState({ query })
    markers.forEach(marker => marker.setVisible(true))

    if (query) {
// eslint-disable-next-line
      this.state.infowindow === null ? null :
        this.state.infowindow !== null ? this.state.infowindow.close(map, marker) : null;

      const match = new RegExp(escapeRegExp(query), 'i')
      workingList = locations.filter(location => match.test(location.name))
      const notVisible = markers.filter(marker =>
        workingList.every(place => place.id !== marker.id)
      )
      notVisible.forEach(marker => marker.setVisible(false))
    } else { workingList = locations }
    this.setState({ workingList })
  }

  handleClick(e, index) {

    let locations = this.state.locations
    let markers = this.state.markers
    e.preventDefault()
    index = e.target.dataset.key
    markers[index].openInfoWindow()
    markers[index].setAnimation(window.google.maps.Animation.BOUNCE);
    setTimeout(function () {
      markers[index].setAnimation(null);
    }, 800);
// eslint-disable-next-line
    window.innerWidth < 600 ? this.setState({ searchHidden: true }) : null
    this.setState({ workingList: locations })
    markers.forEach(marker => marker.setVisible(true))
  }

  toggleSearch() {
    this.setState(prevState => ({
      searchHidden: !prevState.searchHidden
    }));
  }

  screenListener() {
    let self = this
    window.addEventListener("resize", function () {
// eslint-disable-next-line
      window.innerWidth < 600 ? self.setState({ searchHidden: true }) :
        window.innerWidth > 600 ? self.setState({ searchHidden: false }) : null
      self.state.map.fitBounds(self.state.bounds)
    });
  }

  render() {
    return (
      <main className="App" role="main" >

        <section ref="map" className="map" id="map" role="application"></section>

        <section className="right-column" >
          <header className="header" aria-label="Application Header">
            <h3>Encontre um lugar para relaxar em</h3>
            <h1>Colinas da Anhanguera</h1>
            <button id='toggleButton'
              title='TOGGLE LIST'
              type='button'
              onClick={this.toggleSearch}
            >{this.state.searchHidden ? 'SHOW' : 'HIDE'}</button>
          </header>
          {!this.state.searchHidden ?
            <List
              locations={this.state.locations}
              handleClick={this.handleClick}
              updateQuery={this.updateQuery}
              query={this.state.query}
              markers={this.state.markers}
              workingList={this.state.workingList}
              searchHidden={this.state.searchHidden}
            /> : null}
        </section>
        <Modal
          isVisible={this.state.isVisible}
          modalClosed={this.modalClosed}
          startFlickr={this.props.startFlickr}
          modalTitle={this.state.modalTitle}
        />
      </main>
    );
  }
}

export default App;