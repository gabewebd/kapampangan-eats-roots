import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav';
import { Footer } from './components/shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, BottomNavComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
