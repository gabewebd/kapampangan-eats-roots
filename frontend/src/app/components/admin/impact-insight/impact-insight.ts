import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-impact-insight',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="colorClasses" class="bg-white p-8 rounded-2xl shadow-sm border-t-4 hover:shadow-md transition-shadow">
      <div class="mb-4">
        <div [class]="iconBg" class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm mb-4">
          <lucide-icon [name]="icon" class="w-5 h-5"></lucide-icon>
        </div>
        <h3 class="text-4xl font-bold tracking-tight text-gray-900 mb-2">{{ value }}</h3>
        <p class="text-lg font-bold text-gray-900 mb-1 leading-tight">{{ label }}</p>
        <p class="text-sm text-gray-500 leading-relaxed">{{ description }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ImpactInsight {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() description: string = '';
  @Input() icon: string = 'star';
  @Input() color: 'blue' | 'red' | 'yellow' | 'purple' = 'blue';

  get colorClasses() {
    switch (this.color) {
      case 'blue': return 'border-blue-700';
      case 'red': return 'border-red-600';
      case 'yellow': return 'border-yellow-400';
      case 'purple': return 'border-purple-600';
      default: return 'border-gray-200';
    }
  }

  get iconBg() {
    switch (this.color) {
      case 'blue': return 'bg-blue-700';
      case 'red': return 'bg-red-600';
      case 'yellow': return 'bg-yellow-400';
      case 'purple': return 'bg-purple-600';
      default: return 'bg-gray-400';
    }
  }
}
