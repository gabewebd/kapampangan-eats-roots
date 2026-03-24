import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guidelines.html',
  styles: [`
    :host {
      display: block;
      padding-top: 120px;
    }
  `]
})
export class Guidelines {}
