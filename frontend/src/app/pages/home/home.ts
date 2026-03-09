import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, BadgeCheck, MapPin, Star, Utensils, Landmark, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly Search = Search;
  readonly BadgeCheck = BadgeCheck;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly Utensils = Utensils;
  readonly Landmark = Landmark;
  readonly ArrowRight = ArrowRight;

  trendingSpots = [
    {
      name: "Aling Lucing's Sisig",
      description: "The birthplace of the original Kapampangan sisig",
      image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=800",
      rating: 4.9,
      location: "Angeles City",
      verified: true
    },
    {
      name: "Everybody's Cafe",
      description: "Iconic Kapampangan comfort food since 1950",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
      rating: 4.8,
      location: "Angeles City",
      verified: true
    }
  ];

  culturalHighlights = [
    {
      name: "Holy Rosary Parish Church",
      description: "Spanish-era church, est. 1877",
      image: "https://images.unsplash.com/photo-1548625361-9f9fdbdcbdfb?auto=format&fit=crop&q=80&w=800",
      category: "Heritage",
      location: "Angeles City"
    },
    {
      name: "Pamintuan Mansion",
      description: "First anniversary of Philippine independence",
      image: "https://images.unsplash.com/photo-1620216654763-71887e1f44cc?auto=format&fit=crop&q=80&w=800",
      category: "Heritage",
      location: "Angeles City"
    }
  ];

  activeCategory = 'local-eateries';

  setCategory(category: string) {
    this.activeCategory = category;
  }
}
