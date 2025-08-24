using System;
using API.DTOs;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ForumController(IForumRepository forumRepository) : BaseApiController
{
    [HttpGet("threads")]
    public async Task<ActionResult<IEnumerable<ForumThreadDto>>> GetAllThreads()
    {
        var threads = await forumRepository.GetAllThreadsAsync();
        return Ok(threads);
    }

    [HttpGet("threads/{threadId}")]
    public async Task<ActionResult<ForumThreadDto>> GetThread(int threadId)
    {
        var thread = await forumRepository.GetThreadByIdAsync(threadId);
        if (thread == null) return NotFound();

        return Ok(thread);
    }

    [HttpGet("threads/{threadId}/messages")]
    public async Task<ActionResult<IEnumerable<ForumMessageDto>>> GetThreadMessages(int threadId)
    {
        var messages = await forumRepository.GetThreadMessagesAsync(threadId);
        return Ok(messages);
    }

    [HttpPost("threads")]
    public async Task<ActionResult<ForumThreadDto>> CreateThread(CreateThreadDto createThreadDto)
    {
        var userId = User.GetUserId();
        var thread = await forumRepository.CreateThreadAsync(userId, createThreadDto.Title, createThreadDto.Description);

        return CreatedAtAction(nameof(GetThread), new { threadId = thread.Id }, thread);
    }

    [HttpPost("threads/{threadId}/messages")]
    public async Task<ActionResult<ForumMessageDto>> AddMessage(int threadId, CreateMessageDto createMessageDto)
    {
        var userId = User.GetUserId();
        var message = await forumRepository.AddMessageAsync(threadId, userId, createMessageDto.Content);

        return Ok(message);
    }

    [HttpDelete("messages/{messageId}")]
    public async Task<ActionResult> DeleteMessage(int messageId)
    {
        var userId = User.GetUserId();
        var success = await forumRepository.DeleteMessageAsync(messageId, userId);
        
        if (!success) return BadRequest("Message not found or you don't have permission to delete it");
        
        return Ok();
    }

    [HttpDelete("threads/{threadId}")]
    public async Task<ActionResult> DeleteThread(int threadId)
    {
        var userId = User.GetUserId();
        var success = await forumRepository.DeleteThreadAsync(threadId, userId);
        
        if (!success) return BadRequest("Thread not found or you don't have permission to delete it");
        
        return Ok();
    }
}
