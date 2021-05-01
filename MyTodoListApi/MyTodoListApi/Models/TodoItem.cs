using System;
using System.Collections.Generic;

#nullable disable

namespace MyTodoListApi.Models
{
    public partial class TodoItem
    {
        public int Id { get; set; }
        public bool? IsCompleted { get; set; }
        public string Description { get; set; }
        public bool? IsActive { get; set; }
        public int? SortRank { get; set; }
        public int? UserId { get; set; }
    }
}
