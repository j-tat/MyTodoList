using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MyTodoListApi.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace MyTodoListApi.Services
{
    public interface IUserService
    {
        AuthenticateResponse Authenticate(AuthenticateRequest model);
        bool Register(string username, string password);
        User GetById(int id);
    }
    public class UserService : IUserService
    {
        private readonly AppSettings _appSettings;
        private readonly MyTodoListContext _dbContext;

        public UserService(IOptions<AppSettings> appSettings, MyTodoListContext dbContext)
        {
            _appSettings = appSettings.Value;
            _dbContext = dbContext;
        }

        public AuthenticateResponse Authenticate(AuthenticateRequest model)
        {
            var user = _dbContext.Users.SingleOrDefault(x => x.Username == model.Username);

            if (user == null) return null;

            using (var hmac = new HMACSHA512(user.PasswordSalt))
            {
                var computedHash = hmac.ComputeHash((Encoding.UTF8.GetBytes(model.Password)));
                var storedHash = user.PasswordHash;

                if (computedHash.Length != storedHash.Length)
                {
                    return null;
                }

                for(int i = 0; i < computedHash.Length; i++)
                {
                    if(computedHash[i] != storedHash[i])
                    {
                        return null;
                    }
                }
            }

            // authentication successful so generate jwt token
            var token = generateJwtToken(user);
            return new AuthenticateResponse(user, token);
        }

        public bool Register(string username, string password)
        {
            bool isUsernameTaken = _dbContext.Users.Where(x => x.Username == username).Count() > 0;

            if(!isUsernameTaken)
            {
                byte[] passwordHash, passwordSalt;
                CreatePasswordHash(password, out passwordHash, out passwordSalt);

                _dbContext.Users.Add(new User {   
                    Username = username, 
                    PasswordHash = passwordHash, 
                    PasswordSalt = passwordSalt
                });

                _dbContext.SaveChanges();
                return true;
            }

            return false;
        }

        public User GetById(int id)
        {
            return _dbContext.Users.FirstOrDefault(x => x.Id == id);
        }

        private string generateJwtToken(User user)
        {
            // generate token that is valid for 7 days
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("id", user.Id.ToString()) }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private void CreatePasswordHash(string password, out byte[] outHash, out byte[] outSalt)
        {
            if(String.IsNullOrEmpty(password))
            {
                throw new ApplicationException("password cannot be null or empty");
            }
            using(var hmac = new HMACSHA512())
            {
                outSalt = hmac.Key;
                outHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }
    }
}
