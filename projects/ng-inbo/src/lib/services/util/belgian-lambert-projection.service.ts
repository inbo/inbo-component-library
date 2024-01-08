import {Injectable} from "@angular/core";
import proj4 from "proj4";
import {register} from "ol/proj/proj4.js";
import {get as getProjection} from "ol/proj.js";
import {transform} from "ol/proj.js";
import {MapProjectionCode} from "../../enums/projections.enum";

@Injectable({
  providedIn: "root",
})
export class BelgianLambertProjectionService {
  constructor() {
    /**
     * This is a custom projection for the Belgian Lambert 1972 coordinate system.
     * It is based on the proj4 string from https://epsg.io/31370
     * The proj4 string is converted to a proj4.defs object and registered with OpenLayers.
     * The projection can then used to create a new OpenLayers projection object.
     * Because the default projection for OpenLayers is Spherical (Web) Mercator (EPSG:3857),
     * and OpenLayers also already supports the WGS84 projection (EPSG:4326),
     * we want to only define the Belgian Lambert 1972 projection, as this also matches the ArcGIS REST Map service.
     */
    proj4.defs(
      MapProjectionCode.BELGIAN_LAMBERT_72,
      "+proj=lcc +lat_1=49.8333339 +lat_2=51.16666723333333 +lat_0=90 +lon_0=4.367486666666666 " +
      "+x_0=150000.013 +y_0=5400088.438 +ellps=intl " +
      "+towgs84=-106.8686,52.2978,-103.7239,0.3366,-0.456955,-1.84218,1 +units=m +no_defs"
    );

    register(proj4);
  }

  convertLatLongToBelgianLambert72(latLong: [lat: number, long: number]) {
    return transform(
      latLong,
      MapProjectionCode.WGS_84,
      MapProjectionCode.BELGIAN_LAMBERT_72
    );
  }

  convertBelgianLambert72ToLatLong(lambert72Coordinate: [x: number, y: number]) {
    return transform(
      lambert72Coordinate,
      MapProjectionCode.BELGIAN_LAMBERT_72,
      MapProjectionCode.WGS_84
    );
  }

  getProjection() {
    return getProjection(MapProjectionCode.BELGIAN_LAMBERT_72);
  }
}
