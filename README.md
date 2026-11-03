# Urban Heat Island & Drought Analysis Engine

A cloud-based remote sensing and geospatial analytics pipeline developed on **Google Earth Engine (GEE)** to assess Urban Heat Island (UHI) intensity, microclimate variations, and regional drought patterns using multi-spectral and thermal satellite observations (Landsat-8/9, Sentinel-2, and MODIS).

Completed as part of the technical deliverables for the **ISA Remote Sensing and GIS Internship**.

---

## Overview

Rapid urbanization alters regional surface energy balances, creating localized thermal anomalies (Urban Heat Islands) while exacerbating vegetative stress and meteorological drought. 

This repository houses the end-to-end geospatial workflows designed to:
1. **Derive Land Surface Temperature (LST)** via split-window and single-channel approaches using thermal infrared (TIR) bands.
2. **Quantify Surface Urban Heat Island (SUHI)** effects across varying urbanization gradients.
3. **Compute Multi-Index Drought Telemetry** to track vegetation water stress, canopy moisture deficits, and anomalous temperature deviations over multi-temporal baselines.

---

## Key Features

- **Automated Cloud Masking & Composite Generation:** Pixel QA/masking routines across multi-year temporal windows to generate cloud-free median composites.
- **LST Retrieval Pipeline:**
  - Top-of-Atmosphere (TOA) spectral radiance to brightness temperature conversion.
  - Fractional Vegetation Cover ($FVC$) derived from $NDVI$ to compute Land Surface Emissivity ($\varepsilon$).
  - Surface Planck inversion for accurate thermodynamic skin temperature extraction.
- **Multi-Sensor Drought Analytics:**
  - **NDVI** (Normalized Difference Vegetation Index) for canopy greenness and biomass density.
  - **NDWI** (Normalized Difference Water Index) for surface water presence and canopy liquid water status.
  - **VCI / TCI / VHI** (Vegetation Condition Index, Temperature Condition Index, Vegetation Health Index) to identify short-term agricultural drought severity.
- **Spatial Correlation & Zonal Extraction:** Automated zonal statistics aggregating indices across municipal administrative boundaries and land use / land cover (LULC) classes.

---

## Tech Stack & Data Catalogs

- **Platform:** Google Earth Engine (JavaScript Code Editor / Python Earth Engine API)
- **Primary Data Sources:**
  - `LANDSAT/LC08/C02/T1_L2` & `LANDSAT/LC09/C02/T1_L2` (Thermal Infrared Sensors - TIRS, OLI)
  - `COPERNICUS/S2_SR_HARMONIZED` (Sentinel-2 MultiSpectral Instrument)
  - `MODIS/061/MOD11A2` (8-Day Surface Temperature) & `MODIS/061/MOD13Q1` (Vegetation Indices)
- **Local Analysis & Export Tools:** Python (`geemap`, `rasterio`, `geopandas`, `matplotlib`), QGIS

---



