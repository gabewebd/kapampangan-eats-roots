import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trending-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 class="text-lg font-bold text-gray-900 mb-1">Trending Dishes</h3>
      <p class="text-gray-500 text-sm mb-8">Top searched this week</p>
      
      <div class="space-y-6">
        <div *ngFor="let dish of dishes; let i = index" class="flex items-center justify-between group">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {{ i + 1 }}
            </div>
            <div>
              <p class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ dish.name }}</p>
              <p class="text-xs text-gray-400">{{ dish.searches | number }} searches</p>
            </div>
          </div>
          <div [class]="dish.growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'" 
               class="px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-0.5 shadow-sm">
             {{ dish.growth >= 0 ? '+' : '' }}{{ dish.growth }}%
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TrendingList {
  @Input() dishes: any[] = [];
}
