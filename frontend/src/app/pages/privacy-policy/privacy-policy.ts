import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.html',
  styles: [`
    :host {
      display: block;
      padding-top: 120px;
    }
  `]
})
export class PrivacyPolicy {}
