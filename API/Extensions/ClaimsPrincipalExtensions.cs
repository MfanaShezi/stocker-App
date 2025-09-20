using System;
using System.Security.Claims;
using System.Linq;

namespace API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetUserIdController(this ClaimsPrincipal user)
        {

           var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                         user.FindFirst("sub")?.Value ??
                         user.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User ID not found in token claims");

            return userId;
        }
        
        public static int GetUserId(this ClaimsPrincipal user)
        {
       

            var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new Exception("Cannot get username from token"));

            return userId;
        }

        public static string GetUsername(this ClaimsPrincipal user)
        {
            var username = user.FindFirst(ClaimTypes.Name)?.Value ??
                          user.FindFirst("unique_name")?.Value ??
                          user.FindFirst("name")?.Value;

            if (string.IsNullOrEmpty(username))
                throw new InvalidOperationException("Username not found in claims");

            return username;
        }
    }
}
