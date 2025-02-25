import { TestBed } from '@angular/core/testing';

import { BelastingService } from './belasting.service';

describe('BelastingService', () => {
  let service: BelastingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BelastingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
