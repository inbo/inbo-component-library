import { Injectable } from '@angular/core';
import proj4 from 'proj4';

@Injectable({
  providedIn: 'root',
})
export class CoordinatesService {
  private readonly LAMBERT_72 = 'EPSG:31370';
  private readonly WGS_84 = 'EPSG:3857';

  constructor() {
    proj4.defs(
      this.LAMBERT_72,
      '+proj=lcc +lat_0=90 +lon_0=4.36748666666667 +lat_1=51.1666672333333 +lat_2=49.8333339 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,-0.3366,0.457,-1.8422,-1.2747 +units=m +no_defs +type=crs'
    );
    proj4.defs(
      this.WGS_84,
      '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs'
    );
  }

  fromLambert72ToWgs84(
    coordinates: [x: number, y: number]
  ): [x: number, y: number] {
    return proj4(this.LAMBERT_72, this.WGS_84, coordinates);
  }

  fromWgs84ToLambert72(
    coordinates: [x: number, y: number]
  ): [x: number, y: number] {
    return proj4(this.WGS_84, this.LAMBERT_72, coordinates);
  }
}
