import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ForumService } from '../../_services/forum.service';
import { AccountService } from '../../_services/account.service';
import { ForumThread, ForumMessage } from '../../_models/forum';

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './thread-detail.component.html',
  styleUrls: ['./thread-detail.component.css']
})
export class ThreadDetailComponent implements OnInit, OnDestroy {
  private forumService = inject(ForumService);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  threadId!: number;
  thread: ForumThread | null = null;
  messages = this.forumService.currentThreadMessages;
  connectionStatus = this.forumService.connectionStatus;
  currentUser = this.accountService.currentUser;

  messageForm: FormGroup = this.fb.group({
    content: [{ value: '', disabled: false }, [Validators.required, Validators.maxLength(2000)]]
  });

  isLoading = false;

  ngOnInit(): void {

    this.debugToken();
    
    this.route.params.subscribe(params => {
      this.threadId = +params['id'];
      this.loadThread();
      this.loadMessages();
      this.initializeConnection();
    });
  }

  ngOnDestroy(): void {
    if (this.threadId) {
      this.leaveThread();
    }
  }

  loadThread(): void {
    this.forumService.getThread(this.threadId).subscribe({
      next: thread => this.thread = thread,
      error: error => {
        console.error('Error loading thread:', error);
        this.router.navigate(['/forum']);
      }
    });
  }

  loadMessages(): void {
    this.forumService.getThreadMessages(this.threadId);
  }

  initializeConnection(): void {
    const user = this.accountService.currentUser();
    if (user && !this.forumService.isConnected()) {
      this.forumService.createHubConnection(user);
      
      // Wait for connection before joining thread
      setTimeout(() => {
        if (this.forumService.isConnected()) {
          this.joinThread();
        }
      }, 1000);
    } else if (this.forumService.isConnected()) {
      this.joinThread();
    }
  }

  joinThread(): void {
    if (this.forumService.isConnected()) {
      this.forumService.joinThread(this.threadId.toString());
    }
  }

  leaveThread(): void {
    if (this.forumService.isConnected()) {
      this.forumService.leaveThread(this.threadId.toString());
    }
  }

  async sendMessage(): Promise<void> {
    console.log('=== SendMessage Debug ===');
    console.log('Form valid:', this.messageForm.valid);
    console.log('Is loading:', this.isLoading);
    console.log('Connection status:', this.forumService.isConnected());
    
    if (this.messageForm.valid && !this.isLoading) {
      const content = this.messageForm.get('content')?.value;
      console.log('Content:', content);
      console.log('Content trimmed:', content?.trim());
      
      if (content?.trim()) {
        this.isLoading = true;
        console.log('Starting message send...');
        
        // Disable the form control
        this.messageForm.get('content')?.disable();
        
        try {
          if (this.forumService.isConnected()) {
            console.log('Sending via SignalR to thread:', this.threadId);
            const result = await this.forumService.sendMessage(this.threadId, content.trim());
            console.log('SignalR result:', result);
            this.messageForm.reset();
          } else {
            console.log('SignalR not connected, using HTTP fallback');
            this.forumService.addMessage(this.threadId, { content: content.trim() }).subscribe({
              next: (response) => {
                console.log('HTTP response:', response);
                this.loadMessages();
                this.messageForm.reset();
              },
              error: error => console.error('HTTP Error:', error)
            });
          }
        } catch (error) {
          console.error('Send message error:', error);
        } finally {
          this.isLoading = false;
          this.messageForm.get('content')?.enable();
        }
      } else {
        console.log('Content is empty after trim');
      }
    } else {
      console.log('Form invalid or loading');
      console.log('Form errors:', this.messageForm.errors);
      console.log('Content errors:', this.messageForm.get('content')?.errors);
    }
  }

  async deleteMessage(messageId: number): Promise<void> {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        if (this.forumService.isConnected()) {
          await this.forumService.deleteMessageRealTime(messageId, this.threadId);
        } else {
          this.forumService.deleteMessage(messageId).subscribe({
            next: () => this.loadMessages(),
            error: error => console.error('Error deleting message:', error)
          });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  }

  canDeleteMessage(message: ForumMessage): boolean {
    return this.currentUser()?.Id === message.userId;
  }

  canDeleteThread(): boolean {
    return this.currentUser()?.Id === this.thread?.creatorUserId;
  }

  async deleteThread(): Promise<void> {
    if (this.thread && confirm('Are you sure you want to delete this entire thread?')) {
      this.forumService.deleteThread(this.thread.id).subscribe({
        next: () => {
          this.router.navigate(['/forum']);
        },
        error: error => console.error('Error deleting thread:', error)
      });
    }
  }

  formatDate(date: Date): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  trackByMessageId(index: number, message: ForumMessage): number {
    return message.id;
  }

  onKeyDown(event: KeyboardEvent): void {

    if (event.ctrlKey && event.key === 'Enter') {

      this.sendMessage();

    }

  }
  getCharacterCount(): number {
    return this.messageForm.get('content')?.value?.length || 0;
  }
  
  // Add this to thread-detail.component.ts temporarily
debugToken(): void {
  const user = this.currentUser();
  if (user?.token) {
    try {
      const payload = JSON.parse(atob(user.token.split('.')[1]));
      console.log('JWT Token payload:', payload);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
}
}