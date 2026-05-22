import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { Item } from 'shared';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);

  items = signal<Item[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  // Form fields
  newItemName = signal<string>('');
  newItemDesc = signal<string>('');

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.isLoading.set(true);
    this.apiService.getItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load items:', err);
        this.isLoading.set(false);
      }
    });
  }

  onCreateItem() {
    if (!this.newItemName().trim() || !this.newItemDesc().trim()) return;

    this.isSaving.set(true);
    const request = {
      name: this.newItemName().trim(),
      description: this.newItemDesc().trim()
    };

    this.apiService.createItem(request).subscribe({
      next: (newItem) => {
        this.items.update(current => [...current, newItem]);
        this.newItemName.set('');
        this.newItemDesc.set('');
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Failed to create item:', err);
        this.isSaving.set(false);
      }
    });
  }

  onDeleteItem(id: string) {
    if (!confirm('Are you sure you want to delete this resource item?')) return;

    this.apiService.deleteItem(id).subscribe({
      next: (success) => {
        if (success) {
          this.items.update(current => current.filter(item => item.id !== id));
        }
      },
      error: (err) => {
        console.error('Failed to delete item:', err);
      }
    });
  }
}
