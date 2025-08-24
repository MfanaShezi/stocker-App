import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { ForumThread, ForumMessage, CreateThread, CreateMessage } from '../_models/forum';
import { environment } from '../../environments/environment.development';
import { User } from '../_models/User';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.huburl;
  private http = inject(HttpClient);
  
  hubConnection?: HubConnection;
  
  // Signals for reactive state management
  threads = signal<ForumThread[]>([]);
  currentThreadMessages = signal<ForumMessage[]>([]);
  connectionStatus = signal<boolean>(false);
  currentThreadId = signal<number | null>(null);

  createHubConnection(user: User) {
    console.log('Creating hub connection with user:', user.username);
    console.log('Token:', user.token);
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'forumHub', {
        accessTokenFactory: () => {
          console.log('Providing token for SignalR:', user.token);
          return user.token;
        }
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => {
      console.log('Connected to ForumHub');
      this.connectionStatus.set(true);
      
      // Test if the token is working by checking user claims
      this.hubConnection?.invoke('TestConnection')
        .then(() => console.log('Token authentication successful'))
        .catch(error => console.error('Token authentication failed:', error));
        
    }).catch(error => {
      console.error('Error connecting to ForumHub:', error);
      this.connectionStatus.set(false);
    });

    // Listen for real-time events
    this.hubConnection.on('ReceiveMessage', (message: ForumMessage) => {
      // Add new message to current thread if we're viewing it
      if (this.currentThreadId() === message.threadId) {
        this.currentThreadMessages.update(messages => [...messages, message]);
      }
      
      // Update thread's message count and last message time
      this.updateThreadLastMessage(message.threadId, message.createdAt);
    });

    this.hubConnection.on('MessageDeleted', (messageId: number) => {
      // Remove message from current thread
      this.currentThreadMessages.update(messages => 
        messages.filter(m => m.id !== messageId)
      );
    });

    this.hubConnection.on('UserJoined', (username: string, threadId: string) => {
      console.log(`${username} joined thread ${threadId}`);
    });

    this.hubConnection.on('UserLeft', (username: string, threadId: string) => {
      console.log(`${username} left thread ${threadId}`);
    });

    this.hubConnection.on('NewThreadCreated', (thread: ForumThread) => {
      // Add new thread to the beginning of the list
      this.threads.update(threads => [thread, ...threads]);
    });

    this.hubConnection.on('ThreadUpdated', (threadId: number, lastMessageAt: Date) => {
      this.updateThreadLastMessage(threadId, lastMessageAt);
    });

    this.hubConnection.on('Error', (error: string) => {
      console.error('Forum Hub Error:', error);
    });

    // Handle connection events
    this.hubConnection.onreconnecting(() => {
      console.log('Reconnecting to ForumHub...');
      this.connectionStatus.set(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('Reconnected to ForumHub');
      this.connectionStatus.set(true);
    });

    this.hubConnection.onclose(() => {
      console.log('Disconnected from ForumHub');
      this.connectionStatus.set(false);
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }

  // API METHODS 

  getAllThreads() {
    return this.http.get<ForumThread[]>(this.baseUrl + 'forum/threads')
      .subscribe({
        next: threads => this.threads.set(threads)
      });
  }

  getThread(threadId: number) {
    return this.http.get<ForumThread>(`${this.baseUrl}forum/threads/${threadId}`);
  }

  getThreadMessages(threadId: number) {
    this.currentThreadId.set(threadId);
    return this.http.get<ForumMessage[]>(`${this.baseUrl}forum/threads/${threadId}/messages`)
      .subscribe({
        next: messages => this.currentThreadMessages.set(messages)
      });
  }
  addMessage(threadId: number, message: CreateMessage) {
    return this.http.post<ForumMessage>(`${this.baseUrl}forum/threads/${threadId}/messages`, message);
  }
  // createThread(thread: CreateThread) {
  //   return this.http.post<ForumThread>(this.baseUrl + 'forum/threads', thread);
  // }

  deleteThread(threadId: number) {
    return this.http.delete(`${this.baseUrl}forum/threads/${threadId}`);
  }

  deleteMessage(messageId: number) {
    return this.http.delete(`${this.baseUrl}forum/messages/${messageId}`);
  }

  //  SIGNALR HUB METHODS 

  joinThread(threadId: string) {
    return this.hubConnection?.invoke('JoinThread', threadId);
  }

  leaveThread(threadId: string) {
    return this.hubConnection?.invoke('LeaveThread', threadId);
  }

  // async sendMessage(threadId: number, content: string) {
  //   return this.hubConnection?.invoke('SendMessageToThread', threadId, content);
  // }
  async sendMessage(threadId: number, content: string): Promise<void> {
    if (this.hubConnection) {
      console.log('Sending message via SignalR:', { threadId, content });
      return this.hubConnection.invoke('SendMessageToThread', threadId, content);
    } else {
      throw new Error('SignalR connection not available');
    }
  }

  async deleteMessageRealTime(messageId: number, threadId: number) {
    return this.hubConnection?.invoke('DeleteMessage', messageId, threadId);
  }

  async notifyNewThread(threadId: number) {
    return this.hubConnection?.invoke('NotifyNewThread', threadId);
  }

  async createThread(title: string, content: string): Promise<ForumThread> {
    return new Promise((resolve, reject) => {
      if (this.hubConnection) {
        console.log('Creating thread via SignalR:', { title, content });
        
        // Listen for success response
        this.hubConnection.off('ThreadCreatedSuccess');
        this.hubConnection.on('ThreadCreatedSuccess', (thread: ForumThread) => {
          console.log('Thread created successfully:', thread);
          resolve(thread);
        });
        
        // Listen for error response
        this.hubConnection.off('Error');
        this.hubConnection.on('Error', (error: string) => {
          console.error('Thread creation error:', error);
          reject(new Error(error));
        });
        
        // Send the create thread request
        this.hubConnection.invoke('CreateThread', title, content)
          .catch(error => {
            console.error('Failed to invoke CreateThread:', error);
            reject(error);
          });
      } else {
        reject(new Error('SignalR connection not available'));
      }
    });
  }

  // HELPER METHODS


  private updateThreadLastMessage(threadId: number, lastMessageAt: Date) {
    this.threads.update(threads => 
      threads.map(thread => 
        thread.id === threadId 
          ? { ...thread, lastMessageAt, messageCount: thread.messageCount + 1 }
          : thread
      ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    );
  }

  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected || false;
  }

  
}
