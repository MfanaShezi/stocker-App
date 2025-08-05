using System;
using System.Text;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions;

 public static class IdentityServiceExtensions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services,
                                                            IConfiguration config)
        {
           
             services.AddIdentityCore<User>(opt =>
            {
                //password configuration
                opt.Password.RequireNonAlphanumeric = false;
            })
                .AddEntityFrameworkStores<DataContext>();

            services.AddAuthentication(options =>
             {
                 options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                 options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                 options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
             })//https://dotnetfullstackdev.medium.com/jwt-token-authentication-in-c-a-beginners-guide-with-code-snippets-7545f4c7c597
                 .AddJwtBearer(options =>
                 {
                     var tokenKey = config["TokenKey"] ?? throw new Exception("TokenKey not found");

                     options.TokenValidationParameters = new TokenValidationParameters
                     {
                         ValidateIssuerSigningKey = true,
                         IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
                         ValidateIssuer = false,
                         ValidateAudience = false
                     };

                     options.Events = new JwtBearerEvents
                     {
                         OnAuthenticationFailed = context =>
                         {
                             Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                             return Task.CompletedTask;
                         },
                         OnTokenValidated = context =>
                         {
                             Console.WriteLine("Token validated successfully");
                             return Task.CompletedTask;
                         }
                     };
                 });
            services.AddAuthorizationBuilder();
            return services;
        }
    }

