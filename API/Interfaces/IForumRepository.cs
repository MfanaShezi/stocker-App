using System;
using API.DTOs;

namespace API.Interfaces
{
    public interface IForumRepository
    {
        Task<IEnumerable<ForumThreadDto>> GetAllThreadsAsync();
        Task<ForumThreadDto?> GetThreadByIdAsync(int threadId);
        Task<IEnumerable<ForumMessageDto>> GetThreadMessagesAsync(int threadId);
        Task<ForumThreadDto> CreateThreadAsync(int creatorUserId, string title, string? description);
        Task<ForumMessageDto> AddMessageAsync(int threadId, int userId, string content);
        Task<bool> DeleteMessageAsync(int messageId, int userId);
        Task<bool> DeleteThreadAsync(int threadId, int userId);
    }
}
