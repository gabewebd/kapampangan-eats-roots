import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-approval-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow relative z-[9999] pointer-events-auto">
      <div class="flex items-center gap-6 flex-1">
        <img [src]="vendor.images && vendor.images.length > 0 ? vendor.images[0] : 'https://placehold.co/100x100?text=No+Image'" 
             class="w-20 h-20 rounded-xl object-cover shadow-sm bg-gray-50 group-hover:scale-105 transition-transform" 
             [alt]="vendor.name">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h4 class="text-base font-bold text-gray-900 truncate">{{ vendor.name }}</h4>
            <div class="flex gap-1.5 overflow-x-auto pb-1 hide-scroll">
               <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 whitespace-nowrap border border-blue-100/50">
                 {{ vendor.category }}
               </span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-2 flex items-center gap-1">
            Submitted on {{ vendor.createdAt | date }}
            <ng-container *ngIf="vendor.yearsInOperation || vendor.yearEstablished">
               • {{ vendor.yearEstablished || vendor.yearsInOperation }}
            </ng-container>
          </p>
          <p class="text-sm text-gray-600 italic line-clamp-2 max-w-2xl">"{{ vendor.historicalSignificance || vendor.culturalStory }}"</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2 ml-6 shrink-0">
        <button (click)="approve.emit(vendor._id)" 
                class="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-800 transition-colors flex items-center gap-2 group/btn">
          <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
          Approve
        </button>
        <button (click)="reject.emit(vendor._id)" 
                class="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all flex items-center gap-2">
          <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
          Reject
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .hide-scroll::-webkit-scrollbar { display: none; }
    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ApprovalItem {
  @Input() vendor: any;
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
}
