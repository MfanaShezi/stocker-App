using System;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class ForumRepository(DataContext context, IMapper mapper) : IForumRepository
    {
        public async Task<IEnumerable<ForumThreadDto>> GetAllThreadsAsync()
        {
            return await context.ForumThreads
                .Include(ft => ft.User)
                .Where(ft => ft.IsActive)
                .OrderByDescending(ft => ft.LastMessageAt)
                .ProjectTo<ForumThreadDto>(mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<ForumThreadDto?> GetThreadByIdAsync(int threadId)
        {
            return await context.ForumThreads
                .Include(ft => ft.User)
                .Where(ft => ft.Id == threadId && ft.IsActive)
                .ProjectTo<ForumThreadDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<ForumMessageDto>> GetThreadMessagesAsync(int threadId)
        {
            return await context.ForumMessages
                .Include(fm => fm.User)
                .Where(fm => fm.ThreadId == threadId)
                .OrderBy(fm => fm.CreatedAt)
                .ProjectTo<ForumMessageDto>(mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<ForumThreadDto> CreateThreadAsync(int creatorUserId, string title, string? description)
        {
            var thread = new ForumThread
            {
                Title = title,
                Description = description,
                CreatedBy = creatorUserId,
                CreatedAt = DateTime.UtcNow,
                LastMessageAt = DateTime.UtcNow,
                MessageCount = 0,
                IsActive = true
            };

            context.ForumThreads.Add(thread);
            await context.SaveChangesAsync();

            return await GetThreadByIdAsync(thread.Id) ?? throw new InvalidOperationException("Failed to create thread");
        }

        public async Task<ForumMessageDto> AddMessageAsync(int threadId, int userId, string content)
        {
            var message = new ForumMessage
            {
                ThreadId = threadId,
                UserId = userId,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };

            context.ForumMessages.Add(message);

            // Update thread's LastMessageAt and MessageCount
            var thread = await context.ForumThreads.FindAsync(threadId);
            if (thread != null)
            {
                thread.LastMessageAt = DateTime.UtcNow;
                thread.MessageCount++;
            }

            await context.SaveChangesAsync();

            return await context.ForumMessages
                .Include(fm => fm.User)
                .Where(fm => fm.Id == message.Id)
                .ProjectTo<ForumMessageDto>(mapper.ConfigurationProvider)
                .FirstAsync();
        }

        public async Task<bool> DeleteMessageAsync(int messageId, int userId)
        {
            var message = await context.ForumMessages
                .Include(m => m.Thread)
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message == null) return false;
            
            // Check if user owns the message
            if (message.UserId != userId) return false;

            context.ForumMessages.Remove(message);
            
            // Update thread message count
            if (message.Thread != null)
            {
                message.Thread.MessageCount--;
                
                // Update LastMessageAt to the previous message's timestamp
                var lastMessage = await context.ForumMessages
                    .Where(m => m.ThreadId == message.ThreadId && m.Id != messageId)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();
                    
                message.Thread.LastMessageAt = lastMessage?.CreatedAt ?? message.Thread.CreatedAt;
            }

            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteThreadAsync(int threadId, int userId)
        {
            var thread = await context.ForumThreads
                .FirstOrDefaultAsync(t => t.Id == threadId);

            if (thread == null) return false;
            
            // Check if user owns the thread
            if (thread.CreatedBy != userId) return false;

            // Soft delete - just mark as inactive
            thread.IsActive = false;
            
            await context.SaveChangesAsync();
            return true;
        }
    }
}
