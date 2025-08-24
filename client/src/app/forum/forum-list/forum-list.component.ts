import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ForumService } from '../../_services/forum.service';
import { AccountService } from '../../_services/account.service';
import { ForumThread } from '../../_models/forum';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.css']
})
export class ForumListComponent implements OnInit {
  private forumService = inject(ForumService);
  private accountService = inject(AccountService);
  private fb=inject(FormBuilder)

  threads = this.forumService.threads;
  connectionStatus = this.forumService.connectionStatus;

  showNewThreadForm = false;
  newThreadForm: FormGroup;
  isCreatingThread = false;

  constructor(
    private router: Router,
  ) {
    // Initialize the form
    this.newThreadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }
  ngOnInit(): void {
    this.loadThreads();
    this.initializeConnection();
  }

  ngOnDestroy(): void {
    this.forumService.stopHubConnection();
  }

  loadThreads(): void {
    this.forumService.getAllThreads();
  }

  initializeConnection(): void {
    const user = this.accountService.currentUser();
    if (user) {
      this.forumService.createHubConnection(user);
    }
  }

  createNewThread(): void {
    // 
  }

  toggleNewThreadForm(): void {
    this.showNewThreadForm = !this.showNewThreadForm;
    if (!this.showNewThreadForm) {
      this.newThreadForm.reset();
    }
  }

  hideNewThreadForm(): void {
    this.showNewThreadForm = false;
    this.newThreadForm.reset();
  }
  async createThread(): Promise<void> {
    if (this.newThreadForm.valid && !this.isCreatingThread) {
      this.isCreatingThread = true;
      
      try {
        const title = this.newThreadForm.get('title')?.value;
        const content = this.newThreadForm.get('content')?.value;
        
        const newThread = await this.forumService.createThread(title,content);
        
        // Navigate to the new thread
        //this.router.navigate(['/forum/thread', newThread.id]);
        
        // Hide form and reset
        this.hideNewThreadForm();
      } catch (error) {
        console.error('Error creating thread:', error);
        // You could add a toast notification here
      } finally {
        this.isCreatingThread = false;
      }
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  trackByThreadId(index: number, thread: ForumThread): number {
    return thread.id;
  }
}
