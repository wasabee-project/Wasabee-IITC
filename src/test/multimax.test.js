import doMultimax from "../code/multimax";

test("test multimax", () => {
  let a = {
    guid: "4269676e742a4ca8a48b07140ce06b4c.16",
    latE6: -29388659,
    lngE6: -66822636,
    title: "Mural 2 Barrio Antártida",
    getLatLng: function() {
      return {
        lat: this.latE6 / 1000000,
        lng: this.lngE6 / 1000000
      };
    }
  };
  let b = {
    guid: "a636eb70a48048e396707dcc967809f7.16",
    latE6: -33163735,
    lngE6: -64359187,
    title: "Iglesia Del Sur",
    getLatLng: function() {
      return {
        lat: this.latE6 / 1000000,
        lng: this.lngE6 / 1000000
      };
    }
  };
  let C = [
    {
      guid: "e3a1c1a7fcfb4ddcb87c550e348a65c7.16",
      latE6: -32879365,
      lngE6: -61027657,
      title: "Bandera Argentina",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    },
    {
      guid: "ddcc4d05ee304dc2900fb7279ef841b1.16",
      latE6: -32879511,
      lngE6: -61027223,
      title: "Plaza San Martin ",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    },
    {
      guid: "ddcc4d05ee304dc2900fb7279ef841b1.16",
      latE6: -32879667,
      lngE6: -61022866,
      title: "Busto De San Martín",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    },
    {
      guid: "09d4891913754c379f56606269c7db95.16",
      latE6: -32878791,
      lngE6: -61027860,
      title: "Comuna ",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    },
    {
      guid: "994bd1e7cc94476ea983a22c0c42eec3.16",
      latE6: -32879302,
      lngE6: -61027347,
      title: "Busto Homenaje A La Madre",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    },
    {
      guid: "3b472f4da6c64cfab17dfd29d245d0e1.16",
      latE6: -32879959,
      lngE6: -61027292,
      title: "Plazoleta De Malvinas",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    }
  ];
  let res = [
    {
      guid: "e3a1c1a7fcfb4ddcb87c550e348a65c7.16",
      latE6: -32879365,
      lngE6: -61027657,
      title: "Bandera Argentina",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    },
    {
      guid: "ddcc4d05ee304dc2900fb7279ef841b1.16",
      latE6: -32879511,
      lngE6: -61027223,
      title: "Plaza San Martin ",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    },
    {
      guid: "ddcc4d05ee304dc2900fb7279ef841b1.16",
      latE6: -32879667,
      lngE6: -61022866,
      title: "Busto De San Martín",
      getLatLng: function() {
        return {
          lat: this.latE6 / 1000000,
          lng: this.lngE6 / 1000000
        };
      }
    }
  ];
  expect(doMultimax(a, b, C).length).toEqual(res.length);
});
