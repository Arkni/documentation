---
layout: full.html
algolia: true
title: Geopoints
description: Geopoint formats description
order: 40
---

# Geopoints

A geopoint is simply the coordinates, expressed using a latitude and a longitude, of a geographical point.

In Koncorde, geopoints can be defined in multiple ways. All of the following examples are equivalent, and point to the same coordinates of latitude `43.6021299` and longitude `3.8989713`:

* `[ 43.6021299, 3.8989713 ]`
* `"43.6021299, 3.8989713"`
* `"spfb09x0ud5s"` ([geohash](https://en.wikipedia.org/wiki/Geohash))
* `{ lat: 43.6021299, lon: 3.8989713 }`

Alternative 1:

* `{ latLon: [ 43.6021299, 3.8989713 ] }`
* `{ latLon: { lat: 43.6021299, lon: 3.8989713 } }`
* `{ latLon: "43.6021299, 3.8989713" }`
* `{ latLon: "spfb09x0ud5s"}` ([geohash](https://en.wikipedia.org/wiki/Geohash))

Alternative 2:

* `{ lat_lon: [ 43.6021299, 3.8989713 ] }`
* `{ lat_lon: { lat: 43.6021299, lon: 3.8989713 } }`
* `{ lat_lon: "43.6021299, 3.8989713" }`
* `{ lat_lon: "spfb09x0ud5s"}` ([geohash](https://en.wikipedia.org/wiki/Geohash))

