import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { CarsComponent } from './cars.component';

describe('CarAddEditComponent', () => {
  let component: CarsComponent;
  let fixture: ComponentFixture<CarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync paginator state with the current table data', () => {
    const paginator = {
      pageIndex: 2,
      pageSize: 25,
      length: 0,
      page: new Subject<any>(),
      firstPage: jasmine.createSpy('firstPage'),
    } as unknown as MatPaginator;

    component.paginator = paginator;
    component.pageIndex = 2;
    component.pageSize = 25;

    component['setTableData']([{ Id: 1 }, { Id: 2 }, { Id: 3 }]);

    expect(component.dataSource.paginator).toBe(paginator);
    expect(paginator.length).toBe(3);
    expect(paginator.pageIndex).toBe(2);
    expect(paginator.pageSize).toBe(25);
  });
});
