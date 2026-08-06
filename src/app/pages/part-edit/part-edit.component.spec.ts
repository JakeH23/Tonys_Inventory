import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CoreService } from '../../components/core/core.service';
import { PartImagesService } from '../../services/part-images.service';
import { PartService } from '../../services/part.service';
import { PartEditComponent } from './part-edit.component';

describe('PartEditComponent', () => {
  let component: PartEditComponent;
  let partService: jasmine.SpyObj<PartService>;
  let coreService: jasmine.SpyObj<CoreService>;
  let partImagesService: jasmine.SpyObj<PartImagesService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    partService = jasmine.createSpyObj('PartService', ['getPartById', 'updatePart']);
    coreService = jasmine.createSpyObj('CoreService', ['openSnackBar']);
    partImagesService = jasmine.createSpyObj('PartImagesService', ['updatePartImage']);
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    component = new PartEditComponent(
      new FormBuilder(),
      partService as any,
      coreService as any,
      { params: of({ id: 5 }) } as unknown as ActivatedRoute,
      partImagesService as any,
      cdr as any
    );
  });

  it('should load a part by id and populate the form', () => {
    partService.getPartById.and.returnValue(of({ CatalogNumber: 'ABC', Category: 'Electrical', Description: 'Updated part' }));

    component.ngOnInit();

    expect(partService.getPartById).toHaveBeenCalledWith(5);
    expect(component.partForm.get('CatalogNumber')?.value).toBe('ABC');
  });

  it('should submit a valid update and notify the user', () => {
    component.partForm.patchValue({ CatalogNumber: 'ABC', Category: 'Electrical', PartNumber: 'P-1', Description: 'Updated part' });
    partService.updatePart.and.returnValue(of({}));

    component.onFormSubmit();

    expect(partService.updatePart).toHaveBeenCalled();
    expect(coreService.openSnackBar).toHaveBeenCalledWith('Part detail updated!');
  });
});
