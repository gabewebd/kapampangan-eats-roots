import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verified-program',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verified-program.html',
  styles: [`
    :host {
      display: block;
      padding-top: 120px;
    }
  `]
})
export class VerifiedProgram {}
