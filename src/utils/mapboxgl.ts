import mapboxgl from 'mapbox-gl';
import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';

// @ts-ignore
mapboxgl.workerClass = MapboxWorker;
