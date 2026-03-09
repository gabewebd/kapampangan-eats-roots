import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-approval-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
      <div class="flex items-center gap-6 flex-1">
        <img [src]="vendor.image" class="w-20 h-20 rounded-xl object-cover shadow-sm bg-gray-50 group-hover:scale-105 transition-transform" [alt]="vendor.name">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h4 class="text-base font-bold text-gray-900 truncate">{{ vendor.name }}</h4>
            <div class="flex gap-1.5 overflow-x-auto pb-1 hide-scroll">
               <span *ngFor="let cat of vendor.categories" 
                     class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 whitespace-nowrap border border-blue-100/50">
                 {{ cat }}
               </span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-2 flex items-center gap-1">
            by <span class="font-medium text-gray-700">{{ vendor.owner }}</span> • {{ vendor.dateSubmitted | date }} • {{ vendor.yearsInOperation }} years
          </p>
          <p class="text-sm text-gray-600 italic line-clamp-2 max-w-2xl">"{{ vendor.description }}"</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2 ml-6 shrink-0">
        <button (click)="approve.emit(vendor.id)" 
                class="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-800 transition-colors flex items-center gap-2 group/btn">
          <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
          Approve
        </button>
        <button (click)="reject.emit(vendor.id)" 
                class="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all flex items-center gap-2">
          <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
          Reject
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ApprovalItem {
  @Input() vendor: any;
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
}
