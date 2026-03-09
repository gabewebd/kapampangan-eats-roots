import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <div [class]="iconBg + ' p-3 rounded-xl flex items-center justify-center text-white shadow-sm'">
          <lucide-icon [name]="icon" class="w-5 h-5"></lucide-icon>
        </div>
        <button class="text-gray-400 hover:text-gray-600 transition-colors">
          <lucide-icon name="more-horizontal" class="w-5 h-5"></lucide-icon>
        </button>
      </div>
      <div>
        <p class="text-gray-500 text-sm font-medium mb-1">{{ label }}</p>
        <h3 class="text-3xl font-bold tracking-tight text-gray-900 mb-2">{{ value }}</h3>
        <p [class]="trendColor + ' text-sm font-medium flex items-center gap-1'">
          {{ subtitle }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class MetricCard {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() icon: string = 'activity';
  @Input() iconBg: string = 'bg-blue-600';
  @Input() trendColor: string = 'text-gray-400';
}
