import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Home, Map, PlusCircle, User } from 'lucide-angular';

@Component({
  selector: 'app-bottom-nav',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNavComponent {
  readonly Home = Home;
  readonly Map = Map;
  readonly PlusCircle = PlusCircle;
  readonly User = User;
}
