import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-engagement-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h3 class="text-lg font-bold text-gray-900">User Engagement</h3>
          <p class="text-gray-500 text-sm">Page visits & saves — last 7 days</p>
        </div>
        <div class="flex items-center gap-4 text-xs font-medium uppercase tracking-wider">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-blue-700"></span>
            <span class="text-gray-600">Visits</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span class="text-gray-600">Saves</span>
          </div>
        </div>
      </div>
      <div class="h-64 flex items-end justify-between gap-2 relative">
        <div *ngFor="let day of data" class="flex-1 flex flex-col items-center group relative h-full justify-end">
          <div class="flex gap-1 w-full justify-center items-end h-full group-hover:opacity-80 transition-opacity">
            <div [style.height.%]="(day.visits / maxVal) * 100" class="w-2.5 sm:w-4 bg-blue-700 rounded-t-sm relative">
               <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{{ day.visits }}</span>
            </div>
            <div [style.height.%]="(day.saves / maxVal) * 100" class="w-2.5 sm:w-4 bg-yellow-400 rounded-t-sm relative">
               <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{{ day.saves }}</span>
            </div>
          </div>
          <span class="mt-4 text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-tighter">{{ day.day }}</span>
        </div>
        <!-- Grid lines -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          <div class="border-t border-gray-50 w-full h-0"></div>
          <div class="border-t border-gray-50 w-full h-0"></div>
          <div class="border-t border-gray-50 w-full h-0"></div>
          <div class="border-t border-gray-100 w-full h-0"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class EngagementChart {
  @Input() data: any[] = [];
  @Input() maxVal: number = 1000;
}
