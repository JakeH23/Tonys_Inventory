import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PartService } from './part.service';

describe('PartService', () => {
  let service: PartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add a part with the expected endpoint and payload', () => {
    const payload = { CatalogNumber: 'ABC' } as any;

    service.addPart(payload).subscribe();

    const req = httpMock.expectOne('/api/parts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 3 });
  });

  it('should include category and vehicle side in part list params', () => {
    service.getPartList({ page: 1, pageSize: 5, category: 'Electrical', vehicleSide: 'N/S' }).subscribe();

    const req = httpMock.expectOne((request) => request.url.includes('/api/parts'));
    expect(req.request.params.get('category')).toBe('Electrical');
    expect(req.request.params.get('vehicleSide')).toBe('N/S');
    req.flush({ items: [] });
  });
});
