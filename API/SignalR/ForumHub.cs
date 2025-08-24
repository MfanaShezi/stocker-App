using System;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

public class ForumHub(IForumRepository forumRepository, UserManager<User> userManager) : Hub
{
    public async Task JoinThread1(string threadId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Thread_{threadId}");

        // Notify others that user joined
        var username = Context.User?.FindFirst("unique_name")?.Value;
        await Clients.Group($"Thread_{threadId}")
            .SendAsync("UserJoined", username, threadId);
    }
    public async Task JoinThread(string threadId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Thread_{threadId}");

        // Use the same claim access as TestConnection
        var username = Context.User?.Identity?.Name;
        var userid = Context.User?.GetUserId();
        Console.WriteLine($"JoinThread - Username: {username}"); // This will show why it's null

        await Clients.Group($"Thread_{threadId}")
            .SendAsync("UserJoined", username, threadId);
    }
    public async Task LeaveThread(string threadId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Thread_{threadId}");

        // Notify others that user left
        var username = Context.User?.Identity?.Name ?? "Anonymous";
        await Clients.Group($"Thread_{threadId}")
            .SendAsync("UserLeft", username, threadId);
    }
    public async Task SendMessageToThread1(int threadId, string content)
    {
        try
        {
            // Get user ID from claims
            var userId = Context.User?.GetUserId() ?? 0;
            if (userId == 0)
            {
                await Clients.Caller.SendAsync("Error", "User not authenticated");
                return;
            }

            // Save message to database
            var message = await forumRepository.AddMessageAsync(threadId, userId, content);

            // Broadcast message to all users in the thread
            await Clients.Group($"Thread_{threadId}")
                .SendAsync("ReceiveMessage", message);

            // Also broadcast to general forum list to update message counts
            await Clients.All.SendAsync("ThreadUpdated", threadId, message.CreatedAt);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", $"Failed to send message: {ex.Message}");
        }
    }

    public async Task SendMessageToThread(int threadId, string content)
    {
        try
        {
            Console.WriteLine($"SendMessageToThread called with threadId: {threadId}, content: {content}");

            Console.WriteLine($"User Identity Name: '{Context.User?.Identity?.Name}'");
            Console.WriteLine($"User Identity IsAuthenticated: {Context.User?.Identity?.IsAuthenticated}");

            // Use the same approach as TestConnection - get from nameid claim directly
            var username = Context.User?.Identity?.Name;
            var userid = Context.User?.GetUserId();



            Console.WriteLine($"Username: {username}, UserIdClaim: {userid}");

            if (string.IsNullOrEmpty(username) || userid == null)
            {
                Console.WriteLine("Failed to get user ID from token");
                await Clients.Caller.SendAsync("Error", "Cannot get username from token");
                return;
            }

            Console.WriteLine($"Successfully got userId: {userid}");

            // Save message to database using your existing method
            var message = await forumRepository.AddMessageAsync(threadId, (int)userid, content);

            Console.WriteLine($"Message saved with ID: {message.Id}");

            // Broadcast message to all users in the thread
            await Clients.Group($"Thread_{threadId}")
                .SendAsync("ReceiveMessage", message);

            // Also broadcast to general forum list to update message counts
            await Clients.All.SendAsync("ThreadUpdated", threadId, message.CreatedAt);

            Console.WriteLine("Message broadcasted successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"SendMessageToThread Error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            await Clients.Caller.SendAsync("Error", $"Failed to send message: {ex.Message}");
        }
    }
    public async Task TestConnection()
    {
        try
        {
            var username = Context.User?.Identity?.Name;
            var userid = Context.User?.GetUserId();


            Console.WriteLine($"TestConnection - Username: {username}, UserId: {userid}");
            await Clients.Caller.SendAsync("TestSuccess", $"Hello {username}!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"TestConnection error: {ex.Message}");
            await Clients.Caller.SendAsync("Error", $"Test failed: {ex.Message}");
        }
    }
    public async Task CreateThread(string title, string content)
    {
        try
        {
            Console.WriteLine($"CreateThread called with title: {title}, content: {content}");

            var username = Context.User?.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                Console.WriteLine("Username is null or empty");
                await Clients.Caller.SendAsync("Error", "User not authenticated");
                return;
            }

            Console.WriteLine($"Found username: {username}");

            // Get user by username
            var currentUser = await userManager.FindByNameAsync(username);

            if (currentUser == null)
            {
                Console.WriteLine($"Could not find user with username: {username}");
                await Clients.Caller.SendAsync("Error", "User not found in database");
                return;
            }

            Console.WriteLine($"Found user in database: {currentUser.UserName} (ID: {currentUser.Id})");

            // Create thread in database
            var thread = await forumRepository.CreateThreadAsync(currentUser.Id,title, content);

            if (thread == null)
            {
                Console.WriteLine("Failed to create thread in database");
                await Clients.Caller.SendAsync("Error", "Failed to create thread");
                return;
            }

            Console.WriteLine($"Thread created with ID: {thread.Id}");

            // Broadcast new thread to all connected clients
            await Clients.All.SendAsync("ThreadCreated", thread);

            // Send success response to the creator
            await Clients.Caller.SendAsync("ThreadCreatedSuccess", thread);

            Console.WriteLine("Thread creation broadcasted successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"CreateThread Error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            await Clients.Caller.SendAsync("Error", $"Failed to create thread: {ex.Message}");
        }
    }


    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Could track active users here if needed
        await base.OnDisconnectedAsync(exception);
    }
    public override async Task OnConnectedAsync()
    {
        // Could track active users here if needed
        await base.OnConnectedAsync();
    }
}
