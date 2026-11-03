var aoi: MultiPolygon, 17 vertices
type: MultiPolygon

coordinates: List (2 elements)

0: List (1 element)
    0: List (14 elements)

1: List (1 element)
    0: List (5 elements)

        0: [70.56217785381723, 21.137266011796292]
            0: 70.56217785381723
            1: 21.137266011796292

        1: [71.46305676006723, 21.505702445500614]
            0: 71.46305676006723
            1: 21.505702445500614

        2: [70.82584972881723, 22.148217926938585]
            0: 70.82584972881723
            1: 22.148217926938585

        3: [70.32047863506723, 21.99550034081712]
            0: 70.32047863506723
            1: 21.99550034081712

        4: [70.56217785381723, 21.137266011796292]
            0: 70.56217785381723
            1: 21.137266011796292
// Load MODIS NDVI time series
var ndvi = ee.ImageCollection("MODIS/006/MOD13Q1")
  .filterBounds(aoi)
  .filterDate('2015-01-01', '2023-12-31')
  .select('NDVI');

// Min and max NDVI over the whole period (per pixel)
var ndvi_min = ndvi.min();
var ndvi_max = ndvi.max();

// Current period to assess
var ndvi_current = ndvi.filterDate('2023-01-01','2023-12-31').mean();

// Calculate VCI
var vci = ndvi_current.subtract(ndvi_min)
  .divide(ndvi_max.subtract(ndvi_min))
  .rename('VCI');

// Center map and show VCI result
Map.centerObject(aoi, 9);
Map.addLayer(vci, {min:0, max:1, palette:['red','yellow','green']}, 'VCI');

// Classified drought zones map
var droughtClassified = ee.Image(0)
  .where(vci.lt(0.2), 1)
  .where(vci.gte(0.2).and(vci.lt(0.4)), 2)
  .where(vci.gte(0.4).and(vci.lt(0.6)), 3)
  .where(vci.gte(0.6), 4);

Map.addLayer(droughtClassified.clip(aoi), {
  min:1, max:4,
  palette:['red','orange','yellow','green']
}, 'Drought Classes');

// NDVI time series chart
var ndviChart = ui.Chart.image.series({
  imageCollection: ndvi,
  region: aoi,
  reducer: ee.Reducer.mean(),
  scale: 250,
  xProperty: 'system:time_start'
}).setOptions({
  title: 'NDVI Time Series (2015-2023)',
  vAxis: {title: 'Mean NDVI'},
  hAxis: {title: 'Date'}
});
print(ndviChart);

// Print mean VCI value for AOI
var stats = vci.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: aoi,
  scale: 250,
  maxPixels: 1e13
});
print('Mean VCI for AOI:', stats);

// Drought class breakdown
var extreme = vci.lt(0.2);
var moderate = vci.gte(0.2).and(vci.lt(0.4));
var mild = vci.gte(0.4).and(vci.lt(0.6));
var normal = vci.gte(0.6);

var pixelArea = ee.Image.pixelArea().divide(1e6);

function classArea(mask) {
  return pixelArea.updateMask(mask).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 250,
    maxPixels: 1e13
  });
}

print('Extreme drought area (sq km):', classArea(extreme));
print('Moderate drought area (sq km):', classArea(moderate));
print('Mild drought area (sq km):', classArea(mild));
print('Normal area (sq km):', classArea(normal));

// Export VCI map
Export.image.toDrive({
  image: vci,
  description: 'VCI_Drought_Map',
  scale: 250,
  region: aoi
});

// Export classified drought map
Export.image.toDrive({
  image: droughtClassified,
  description: 'Drought_Classified_Map',
  scale: 250,
  region: aoi
});