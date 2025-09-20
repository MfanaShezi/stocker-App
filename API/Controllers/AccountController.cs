using System;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Humanizer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(UserManager<User> userManager, ITokenService tokenService, IMapper mapper) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDTO)
    {
        if (await UserExists(registerDTO))
            return BadRequest("Username or email is  taken");


        var user = mapper.Map<User>(registerDTO);
        user.UserName = registerDTO.Username.ToLower();
        user.Email = registerDTO.Email.ToLower();
        user.InvestmentGoal = registerDTO.InvestmentGoal;
        user.InvestmentStyle = registerDTO.InvestmentStyle;
        user.RiskAppetite = registerDTO.RiskAppetite;
        var result = await userManager.CreateAsync(user, registerDTO.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return new UserDto
        {
            Username = user.UserName,
            Email = user.Email,
            Token = await tokenService.CreateToken(user),
            RiskAppetite = (RiskAppetite)(user.RiskAppetite ?? default),
            InvestmentGoal = (InvestmentGoal)user.InvestmentGoal,
            InvestmentStyle = (InvestmentStyle)user.InvestmentStyle

        };
    }

    [HttpPost("login")] // POST: api/account/login
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.NormalizedUserName == loginDto.Username.ToUpper());
        
         if (user == null || user.UserName == null) return Unauthorized("Invalid username");
        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!result) return Unauthorized();

        return new UserDto
        {
            Username = user.UserName,
            Email = user.Email!,
            Token = await tokenService.CreateToken(user),
            RiskAppetite = (RiskAppetite)user.RiskAppetite!,
            InvestmentGoal = (InvestmentGoal)user.InvestmentGoal!,
            InvestmentStyle = (InvestmentStyle)user.InvestmentStyle!
        };
    }


    private async Task<bool> UserExists(RegisterDto registerDTO)
    {
        var user = await userManager.Users.AnyAsync(x => x.NormalizedUserName == registerDTO.Username.ToUpper());
        var email = await userManager.Users.AnyAsync(x => x.NormalizedEmail == registerDTO.Email.ToUpper());

        return user || email;
    }
}
