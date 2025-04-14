import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InboAutocompleteComponent } from './inbo-autocomplete.component';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InboInputMaskDirective } from '../../directives/input-mask/inbo-input-mask.directive';
import { InboDebouncedInputChange } from '../../directives/debounced-input-change/inbo-debounced-input-change.directive';

describe('InboAutocompleteComponent', () => {
  let component: InboAutocompleteComponent<any>;
  let fixture: ComponentFixture<InboAutocompleteComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InboAutocompleteComponent,
        InboInputMaskDirective,
        InboDebouncedInputChange
      ],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InboAutocompleteComponent);
    component = fixture.componentInstance;
    component.searchFunction = () => of([]);
  });

  describe('Masking functionality', () => {
    it('should apply mask pattern correctly for alphanumeric values', () => {
      component.mask = 'XX-XX-XX';
      const result = component.applyMask('ABC123');
      expect(result).toBe('AB-C1-23');
    });

    it('should handle mask with spaces', () => {
      component.mask = 'XX XX XX';
      const result = component.applyMask('ABC123');
      expect(result).toBe('AB C1 23');
    });

    it('should handle mask with slashes', () => {
      component.mask = 'XX/XX/XX';
      const result = component.applyMask('ABC123');
      expect(result).toBe('AB/C1/23');
    });

    it('should handle mixed mask characters', () => {
      component.mask = 'XX-XX/XX XX';
      const result = component.applyMask('ABC123');
      expect(result).toBe('AB-C1/23');
    });

    it('should handle input shorter than mask', () => {
      component.mask = 'XX-XX-XX';
      const result = component.applyMask('AB');
      expect(result).toBe('AB');
    });

    it('should handle empty input', () => {
      component.mask = 'XX-XX-XX';
      const result = component.applyMask('');
      expect(result).toBe('');
    });

    it('should apply mask during input change', () => {
      component.mask = 'XX-XX-XX';
      const inputValue = 'ABC123';
      component.inputChanged(inputValue);
      expect(component.displayValue).toBe('AB-C1-23');
    });

    it('should not apply mask when no mask is set', () => {
      component.mask = undefined;
      const inputValue = 'ABC123';
      component.inputChanged(inputValue);
      expect(component.displayValue).toBe('ABC123');
    });

    it('should handle special characters in input', () => {
      component.mask = 'XX-XX-XX';
      const result = component.applyMask('A@B#C$1%2^3');
      expect(result).toBe('AB-C1-23');
    });
  });
});
