import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CarService } from './car.service';

describe('CarService', () => {
  let service: CarService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add a car with the expected endpoint and payload', () => {
    const payload = { Make: 'Ford' } as any;

    service.addCar(payload).subscribe();

    const req = httpMock.expectOne('/api/cars');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it('should build query params for car list requests', () => {
    service.getCarList({ page: 2, pageSize: 10, sortBy: 'Make', sortDirection: 'asc', search: 'mustang', filter: 'boxed' }).subscribe();

    const req = httpMock.expectOne((request) => request.url.includes('/api/cars'));
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sortBy')).toBe('Make');
    expect(req.request.params.get('sortDirection')).toBe('asc');
    expect(req.request.params.get('search')).toBe('mustang');
    expect(req.request.params.get('filter')).toBe('boxed');
    req.flush([]);
  });
});
