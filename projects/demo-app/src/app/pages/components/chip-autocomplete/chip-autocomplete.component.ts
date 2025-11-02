import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InboChipAutocompleteComponent } from 'projects/ng-inbo/src/public-api';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-chip-autocomplete',
  standalone: true,
  imports: [FormsModule, InboChipAutocompleteComponent],
  templateUrl: 'chip-autocomplete.component.html',
  styleUrls: ['chip-autocomplete.component.scss'],
})
export class ChipAutocompleteComponent {
  selectedTags = signal<Array<string>>([]);
  selectedUsers = signal<Array<string>>([]);
  tagInput = signal<string>('');
  userInput = signal<string>('');

  private readonly allTags: Array<Tag> = [
    { id: '1', name: 'Angular', color: 'red' },
    { id: '2', name: 'TypeScript', color: 'blue' },
    { id: '3', name: 'JavaScript', color: 'yellow' },
    { id: '4', name: 'RxJS', color: 'purple' },
    { id: '5', name: 'Material Design', color: 'green' },
    { id: '6', name: 'Testing', color: 'orange' },
    { id: '7', name: 'Performance', color: 'cyan' },
    { id: '8', name: 'Accessibility', color: 'pink' },
  ];

  private readonly allUsers: Array<User> = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
    { id: '3', name: 'Carol Williams', email: 'carol@example.com' },
    { id: '4', name: 'David Brown', email: 'david@example.com' },
    { id: '5', name: 'Emma Davis', email: 'emma@example.com' },
    { id: '6', name: 'Frank Miller', email: 'frank@example.com' },
  ];

  filteredTags = signal<Array<Tag>>([...this.allTags]);
  filteredUsers = signal<Array<User>>([...this.allUsers]);

  constructor() {
    effect(() => {
      const query = this.tagInput().toLowerCase();
      const selected = this.selectedTags();
      this.filteredTags.set(
        this.allTags.filter(
          tag =>
            tag.name.toLowerCase().includes(query) && !selected.includes(tag.id)
        )
      );
    });

    effect(() => {
      const query = this.userInput().toLowerCase();
      const selected = this.selectedUsers();
      this.filteredUsers.set(
        this.allUsers.filter(
          user =>
            (user.name.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query)) &&
            !selected.includes(user.id)
        )
      );
    });
  }

  selectedTagsData = computed(() => {
    return this.selectedTags()
      .map(id => this.allTags.find(tag => tag.id === id))
      .filter((tag): tag is Tag => tag !== undefined);
  });

  selectedUsersData = computed(() => {
    return this.selectedUsers()
      .map(id => this.allUsers.find(user => user.id === id))
      .filter((user): user is User => user !== undefined);
  });

  getTagById(id: string): Tag | undefined {
    return this.allTags.find(tag => tag.id === id);
  }

  getUserById(id: string): User | undefined {
    return this.allUsers.find(user => user.id === id);
  }
}
