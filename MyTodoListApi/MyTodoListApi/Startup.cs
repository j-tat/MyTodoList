using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyTodoListApi.Models;
using Microsoft.Extensions.Configuration;
using MyTodoListApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.HttpOverrides;

namespace MyTodoListApi
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            var appsettingsSection = Configuration.GetSection("AppSettings");
            services.Configure<AppSettings>(appsettingsSection);

            services.AddDbContext<MyTodoListContext>(options =>
            {
                options.UseNpgsql(@"Server=localhost;Database=mytodolist;User Id=mytodolistdev;Password=mytodolistdev;");
                //options.UseInMemoryDatabase();
            });

            services.AddCors(options =>
            {
                options.AddPolicy(name: "_myAllowSpecificOrigins",
                                  builder =>
                                  {
                                      builder.WithOrigins("http://localhost:4200")
                                      //builder.AllowAnyOrigin()
                                      .AllowCredentials()
                                      .AllowAnyHeader()
                                      .AllowAnyMethod();
                                  });
            });


            var appSettings = appsettingsSection.Get<AppSettings>();
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var dbContext = context.HttpContext.RequestServices.GetRequiredService<MyTodoListContext>();
                        var id = context.Principal.Claims.First(x => x.Type == "id").Value;
                        var idNum = int.Parse(id);
                        var user = dbContext.Users.Where(x => x.Id == idNum).FirstOrDefault();
                        if (user == null)
                        {
                            // return unauthorized if user no longer exists
                            context.Fail("Unauthorized");
                        }
                        context.HttpContext.Items["User"] = user;

                        //TODOTODO
                        bool isAdmin = false;
                        if(isAdmin)
                        {
                            var claims = new List<Claim>
                            {
                                new Claim(ClaimTypes.Role, "Administrator")
                            };

                            var identity = new ClaimsIdentity(claims);

                            context.Principal.AddIdentity(identity);
                        }


                        return Task.CompletedTask;
                    },
                    OnMessageReceived = context =>
                    {
                        var cookies = context.Request.Cookies;
                        var tokenCookieValue = cookies["token-cookie"];
                        context.Token = tokenCookieValue;
                        return Task.CompletedTask;
                    }
                };
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

            services.AddScoped<IUserService, UserService>();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseExceptionHandler(app =>
            {
                app.Run(async context =>
                {
                    context.Response.StatusCode = 500;
                    await context.Response.WriteAsync("Internal server error.");
                });
                //app.UseHsts();
            });

            //app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("_myAllowSpecificOrigins");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
