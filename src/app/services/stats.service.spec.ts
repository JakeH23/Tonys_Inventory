import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request the dashboard report endpoint', () => {
    service.getDashboardReport().subscribe();

    const req = httpMock.expectOne('/api/statistics/report');
    expect(req.request.method).toBe('GET');
    req.flush({ totalCars: 0 });
  });

  it('should request the export endpoints with blob responses', () => {
    service.exportCars().subscribe();
    const carsReq = httpMock.expectOne('/api/statistics/export/cars');
    expect(carsReq.request.responseType).toBe('blob');
    carsReq.flush(new Blob());

    service.exportParts().subscribe();
    const partsReq = httpMock.expectOne('/api/statistics/export/parts');
    expect(partsReq.request.responseType).toBe('blob');
    partsReq.flush(new Blob());
  });
});
