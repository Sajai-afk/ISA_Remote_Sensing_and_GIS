// Define Chennai AOI using official boundary
var aoi = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.eq('ADM2_NAME', 'Chennai'))
  .geometry();
Map.centerObject(aoi, 10);
Map.addLayer(aoi, {color: 'red'}, 'Chennai District');
print('Total AOI area (sq km):', aoi.area(1).divide(1e6));

// Load Landsat-8 Image Collection
var image = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 10))
  .median();

// Compute NDVI
var ndvi = image.normalizedDifference(['SR_B5','SR_B4']).rename('NDVI');

// Extract thermal band and convert to LST (Celsius)
var lst = image.select('ST_B10')
  .multiply(0.00341802)
  .add(149.0)
  .subtract(273.15)
  .rename('LST');

// Calculate NDBI and correlation with LST
var ndbi = image.normalizedDifference(['SR_B6','SR_B5']).rename('NDBI');
Map.addLayer(ndbi, {min:-0.2, max:0.3, palette:['green','yellow','red']}, 'Built-up Density');
var combined = ndbi.addBands(lst);
var correlation = combined.reduceRegion({
  reducer: ee.Reducer.pearsonsCorrelation(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});
print('NDBI-LST Correlation:', correlation);

// Visualize LST
Map.addLayer(lst, {min:20, max:45, palette:['blue','yellow','red']}, 'LST');

// Identify Urban Heat Zones (LST > 35°C)
var uhi = lst.gt(35);
Map.addLayer(uhi.updateMask(uhi), {palette:['red']}, 'UHI Zones');

// Mean LST statistics
var stats = lst.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});
print('Mean LST for AOI (°C):', stats);

// UHI zone area
var pixelArea = ee.Image.pixelArea().divide(1e6);
var uhiArea = pixelArea.updateMask(uhi).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});
print('Urban Heat Zone area (sq km):', uhiArea);

// Export
Export.image.toDrive({
  image: lst,
  description: 'LST_Chennai_Map',
  scale: 30,
  region: aoi
});