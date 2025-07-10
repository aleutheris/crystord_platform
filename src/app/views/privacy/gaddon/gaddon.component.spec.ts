import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaddonComponent } from './gaddon.component';

describe('GaddonComponent', () => {
  let component: GaddonComponent;
  let fixture: ComponentFixture<GaddonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaddonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GaddonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
