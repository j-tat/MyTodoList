using System;
using System.Collections.Generic;

#nullable disable

namespace MyTodoListApi.Models
{
    public partial class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
    }
}
