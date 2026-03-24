import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './guidelines.html',
  styles: [`
    :host {
      display: block;
      padding-top: 120px;
    }
  `]
})
export class Guidelines {}
