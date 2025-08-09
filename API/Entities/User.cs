using System;
using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class User: IdentityUser<int>
{
   // public int Id { get; set; }
    //public required string Username { get; set; }
   // public  required string password { get; set; }
    //public required string Email { get; set; }
    public WatchList? Watchlist { get; set; }

}
