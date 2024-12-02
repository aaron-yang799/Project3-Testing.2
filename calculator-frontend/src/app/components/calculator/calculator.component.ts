import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-[32rem]">
        <div class="mb-4 ml-2 font-mono text-2xl flex border border-gray-300 rounded p-4 relative">
          <div class="flex-1 overflow-x-auto pr-4 pb-2">
            <input
              [(ngModel)]="expression"
              (ngModelChange)="onExpressionChange($event)"
              (keydown)="handleKeydown($event)"
              (paste)="handlePaste($event)"
              class="outline-none border-none min-w-full bg-transparent"
              placeholder="0"
              style="width: fit-content;"
            >
          </div>
          <div class="flex-none whitespace-nowrap ml-2 border-l border-gray-200 pl-2">
            <!-- Only show equals and result when there's an expression -->
            <ng-container *ngIf="expression">
              = {{ currentResult }}
            </ng-container>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button *ngFor="let btn of calculatorButtons"
                  (click)="handleInput(btn)"
                  [ngClass]="getButtonClass(btn)"
                  class="h-12 flex items-center justify-center text-lg font-medium rounded border hover:bg-gray-100 transition-colors">
            {{ btn }}
          </button>
        </div>

        <div *ngIf="error" class="mt-2 text-red-600 text-sm">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overflow-x-auto::-webkit-scrollbar {
      height: 6px;
    }

    .overflow-x-auto::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
      margin-left: 4px;  /* Add margin to scrollbar track */
      margin-right: 4px; /* Add margin to scrollbar track */

    }

    .overflow-x-auto::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})

export class CalculatorComponent {
  expression: string = '';
  currentResult: string | null = null;
  error: string | null = null;
  calculatorButtons: string[] = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    'C', '0', '.',
    '·', '−', '+'
  ];

  // Valid characters that can be typed
  // validCharacters = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '·', '−', '+']);
  validCharacters = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '·', '−', '+', '-']);

  operationSymbols: { [key: string]: string } = {
    '·': 'multiply',
    '−': 'subtract',
    '+': 'add'
  };

  constructor(private http: HttpClient) {}

  onExpressionChange(value: string) {
    // Only allow characters that are on the calculator buttons
    const cleanedValue = value
      .split('')
      .filter(char => this.validCharacters.has(char))
      .join('');

    if (cleanedValue !== value) {
      this.expression = cleanedValue;
    }
    this.calculateLive();
  }

  handleKeydown(event: KeyboardEvent) {
    // Prevent default for most keys
    if (event.key !== 'Backspace' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'Delete' &&
        !event.metaKey &&
        !event.ctrlKey) {

      const keyMap: { [key: string]: string } = {
        '*': '·',
        'x': '·',
        '-': '−',
        'Enter': '=',
        'Escape': 'C'
      };

      // Only allow mapped keys or direct valid characters
      if (keyMap[event.key]) {
        event.preventDefault();
        this.handleInput(keyMap[event.key]);
      } else if (!this.validCharacters.has(event.key)) {
        event.preventDefault();
      }
    }
  }

  // Prevent pasting invalid characters
  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const cleanedText = pastedText
      .split('')
      .filter(char => this.validCharacters.has(char))
      .join('');

    if (cleanedText) {
      this.expression += cleanedText;
      this.calculateLive();
    }
  }

  // Rest of the component code remains the same...

handleInput(value: string) {
    switch(value) {
      case 'C':
        this.clear();
        break;
      case '=':
        this.calculateFinal();
        break;
      case '(':
        // Don't allow ( after a number or )
        if (this.expression &&
            (!isNaN(Number(this.expression[this.expression.length - 1])) ||
             this.expression[this.expression.length - 1] === ')')) {
          return;
        }
        this.expression += value;
        break;
      case ')':
        // Check if we have matching parentheses
        const openCount = (this.expression.match(/\(/g) || []).length;
        const closeCount = (this.expression.match(/\)/g) || []).length;
        if (openCount <= closeCount) return;
        // Don't allow ) after an operator
        if ('·−+('.includes(this.expression[this.expression.length - 1])) return;
        this.expression += value;
        break;
        case '·':
        case '−':
        case '+':
            if (!this.expression && value === '−') {
                // Allow negative at start
                this.expression = value;
            } else if (this.expression) {
                const lastChar = this.expression[this.expression.length - 1];
                if ('·−+'.includes(lastChar)) {
                    // Remove the ability to add minus after multiplication
                    if (value === '−' && lastChar !== '−' && lastChar !== '·') {
                        this.expression += value;
                    } else {
                        this.expression = this.expression.slice(0, -1) + value;
                    }
                } else if (lastChar !== '(') {
                    this.expression += value;
                }
            }
            break;
      default:
        if (value === '.' && this.getLastNumber().includes('.')) return;
        this.expression += value;
    }
    this.calculateLive();
  }

  clear() {
    this.expression = '';
    this.currentResult = null;
    this.error = null;
  }

  calculateFinal() {
    if (this.currentResult) {
      this.expression = this.currentResult;
      this.currentResult = null;
    }
  }

  async calculateLive() {
    if (!this.expression) {
      this.currentResult = null;
      return;
    }

    // Check if expression ends with an operator
    if (['·', '−', '+'].includes(this.expression[this.expression.length - 1])) {
      this.currentResult = null;
      return;
    }

    try {
      // Handle initial negative number
      if (this.expression.startsWith('−')) {
        this.expression = '-' + this.expression.slice(1);
      }

      const parts = this.expression.split(/([·−+])/);
      if (!parts[0] && parts.length > 1) {
        // Handle case where expression starts with an operator
        parts.shift();
      }

      let result = parseFloat(parts[0]);

      if (isNaN(result)) {
        this.currentResult = null;
        return;
      }

      for (let i = 1; i < parts.length; i += 2) {
        const operator = parts[i];
        const nextNumber = parseFloat(parts[i + 1]);

        if (isNaN(nextNumber)) {
          continue;
        }

        const response = await firstValueFrom(this.http.post('http://localhost:3000/api/calculate', {
          num1: result,
          num2: nextNumber,
          operation: this.operationSymbols[operator]
        }));

        result = (response as any).result;
      }

      this.currentResult = result.toString();
      this.error = null;
    } catch (error: any) {
      this.error = error.error?.error || 'Calculation error';
      this.currentResult = null;
    }
  }

  getLastNumber(): string {
    const numbers = this.expression.split(/(?=[−+·])/);
    return numbers[numbers.length - 1].replace(/[−+·]/, '') || '';
  }


  getButtonClass(btn: string): string {
    if ('0123456789.'.includes(btn)) {
      return 'bg-white';
    } else if (btn === 'C') {
      return 'bg-red-50 text-red-600';
    } else {
      return 'bg-gray-50';
    }
  }
}
