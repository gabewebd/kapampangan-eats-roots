import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-of-service.html',
  styles: [`
    :host {
      display: block;
      padding-top: 120px;
    }
  `]
})
export class TermsOfService {}
