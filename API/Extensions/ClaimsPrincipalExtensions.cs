using System;
using System.Security.Claims;
using System.Linq;

namespace API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
         public static int GetUserId(this ClaimsPrincipal user)
        {
            var userId =int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) 
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
