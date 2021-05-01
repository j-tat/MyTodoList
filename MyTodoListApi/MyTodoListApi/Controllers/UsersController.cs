using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyTodoListApi.Models;
using MyTodoListApi.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MyTodoListApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("authenticate")]
        public IActionResult Authenticate(AuthenticateRequest model)
        {
            var response = _userService.Authenticate(model);

            if (response == null)
                return BadRequest("Username or password is incorrect");


            HttpContext.Response.Cookies.Append(
                "token-cookie",
                response.Token,
                new CookieOptions()
                {
                    Path = "/",
                    HttpOnly = true,
                    SameSite = SameSiteMode.None,
                    Secure = true
                }
            );
            
            return Ok(response);
        }

        [HttpPost("register")]
        public IActionResult Register(RegisterRequest model)
        {
            var success = _userService.Register(model.Username, model.Password);

            if(!success)
            {
                return Conflict("Username is taken.");
            }

            return Ok();
        }
    }
}
