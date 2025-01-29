import { TestBed } from '@angular/core/testing';

import { AtomService } from './atom.service';

describe('AtomService', () => {
  let service: AtomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
