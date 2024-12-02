import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CalculatorComponent } from './calculator.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    // Create HTTP spy
    httpClient = jasmine.createSpyObj('HttpClient', ['post']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        FormsModule,
        CalculatorComponent
      ],
      providers: [
        { provide: HttpClient, useValue: httpClient }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should load component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Basic Input Handling', () => {
    it('should add numbers to expression when clicked', () => {
      component.handleInput('1');
      component.handleInput('2');
      component.handleInput('3');

      expect(component.expression).toBe('123');
    });

    it('should handle decimal points correctly', () => {
      component.handleInput('1');
      component.handleInput('.');
      component.handleInput('5');

      expect(component.expression).toBe('1.5');
    });

    it('should prevent multiple decimal points in same number', () => {
      component.handleInput('1');
      component.handleInput('.');
      component.handleInput('5');
      component.handleInput('.');

      expect(component.expression).toBe('1.5');
    });

    it('should allow decimal point after operator', () => {
      component.handleInput('1');
      component.handleInput('+');
      component.handleInput('0');
      component.handleInput('.');
      component.handleInput('5');

      expect(component.expression).toBe('1+0.5');
    });
  });

  describe('Operator Handling', () => {
    it('should handle operators correctly', () => {
      component.handleInput('1');
      component.handleInput('·');
      component.handleInput('2');

      expect(component.expression).toBe('1·2');
    });

    it('should replace operator when another is clicked', () => {
      component.handleInput('1');
      component.handleInput('·');
      component.handleInput('−');

      expect(component.expression).toBe('1−');
    });

    it('should not start with an operator', () => {
      component.handleInput('·');
      expect(component.expression).toBe('');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear the expression', () => {
      component.handleInput('1');
      component.handleInput('2');
      component.handleInput('3');
      component.handleInput('C');

      expect(component.expression).toBe('');
      expect(component.currentResult).toBeNull();
      expect(component.error).toBeNull();
    });
  });

  describe('Keyboard Input', () => {
    it('should handle mapped keys correctly', () => {
      const events = [
        new KeyboardEvent('keydown', { key: '*' }),
        new KeyboardEvent('keydown', { key: '-' }),
        new KeyboardEvent('keydown', { key: 'x' })
      ];

      component.handleInput('1');
      component.handleKeydown(events[0]);  // '*' maps to '·'
      component.handleInput('2');

      expect(component.expression).toBe('1·2');
    });

    it('should prevent invalid characters', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const preventDefaultSpy = spyOn(event, 'preventDefault');

      component.handleKeydown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(component.expression).toBe('');
    });
  });

  describe('Calculation Logic', () => {
    it('should calculate expression through API', fakeAsync(() => {
      httpClient.post.and.returnValue(of({ result: 3 }));

      component.handleInput('1');
      component.handleInput('+');
      component.handleInput('2');

      tick();  // Wait for async operation

      expect(httpClient.post).toHaveBeenCalledWith('http://localhost:3000/api/calculate', {
        num1: 1,
        num2: 2,
        operation: 'add'
      });
      expect(component.currentResult).toBe('3');
    }));

    it('should calculate negative numbers correctly through API', fakeAsync(() => {
      httpClient.post.and.returnValue(of({ result: 1 }));

      component.handleInput('-');
      component.handleInput('1');
      component.handleInput('+');
      component.handleInput('2');

      tick();  // Wait for async operation

      expect(httpClient.post).toHaveBeenCalledWith('http://localhost:3000/api/calculate', {
        num1: -1,
        num2: 2,
        operation: 'add'
      });
      expect(component.currentResult).toBe('1');
    }));

    it('should handle API errors', fakeAsync(() => {
      httpClient.post.and.returnValue(throwError(() => ({ error: { error: 'Test error' } })));

      component.handleInput('1');
      component.handleInput('·');
      component.handleInput('2');

      tick();  // Wait for async operation

      expect(component.error).toBe('Test error');
      expect(component.currentResult).toBeNull();
    }));
  });

  describe('Paste Handling', () => {
    it('should handle valid pasted content', () => {
      const event = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer()
      });
      spyOn(event.clipboardData!, 'getData').and.returnValue('123.45');

      component.handlePaste(event);

      expect(component.expression).toBe('123.45');
    });

    it('should filter invalid characters from pasted content', () => {
      const event = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer()
      });
      spyOn(event.clipboardData!, 'getData').and.returnValue('123abc456');

      component.handlePaste(event);

      expect(component.expression).toBe('123456');
    });
  });
});
