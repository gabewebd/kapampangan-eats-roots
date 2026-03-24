import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-verified-program',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verified-program.html',
  styles: [`
    :host {
      display: block;
      padding-top: 120px;
    }
  `]
})
export class VerifiedProgram {}
