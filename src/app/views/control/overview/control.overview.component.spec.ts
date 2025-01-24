import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlOverviewComponent } from './control.overview.component';

describe('ControlOverviewComponent', () => {
  let component: ControlOverviewComponent;
  let fixture: ComponentFixture<ControlOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
