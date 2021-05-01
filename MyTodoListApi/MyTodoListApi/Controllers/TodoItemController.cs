using Microsoft.AspNetCore.Mvc;
using System.Linq;
using MyTodoListApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace MyTodoListApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoItemController : ControllerBase
    {
        private readonly MyTodoListContext _context;

        public TodoItemController(MyTodoListContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public IActionResult Get()
        {
            var user = (User)HttpContext.Items["User"];
            var items = _context.TodoItems;
            var filteredItems = items.Where(x => x.IsActive == true && x.UserId == user.Id).OrderBy(x => x.SortRank);
            return Ok(filteredItems);
        }

        [Authorize]
        [HttpPost]
        public TodoItem Post([FromBody] TodoItem item)
        {
            var user = (User)HttpContext.Items["User"];

            var maxSortRank = _context.TodoItems.Where(x => x.IsActive == true && x.UserId == user.Id).Max(x => x.SortRank);
            item.SortRank = maxSortRank == null ? 1000 : maxSortRank + 1000;

            item.IsActive = true;
            item.UserId = user.Id;

            _context.Add(item);
            _context.SaveChanges();
            return item;
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] TodoItem item)
        {
            var itemFromDb = _context.TodoItems.FirstOrDefault(x => x.Id == id);

            if(itemFromDb == null)
            {
                return BadRequest();
            }

            itemFromDb.Description = item.Description;
            itemFromDb.IsCompleted = item.IsCompleted;
            itemFromDb.IsActive = item.IsActive;
            itemFromDb.SortRank = item.SortRank;
            _context.SaveChanges();

            return Ok();
        }

        [Authorize]
        [HttpPut]
        public void Put([FromBody] TodoItem[] items)
        {
            var user = (User)HttpContext.Items["User"];
            var itemsFromDb = _context.TodoItems.Where(x => x.IsActive == true && x.UserId == user.Id);
            foreach(var curItemFromDb in itemsFromDb)
            {
                var curItemFromBody = items.Where(x => x.Id == curItemFromDb.Id).FirstOrDefault();
                if(curItemFromBody != null)
                {
                    curItemFromDb.SortRank = curItemFromBody.SortRank;
                }
            }
            _context.SaveChanges();
        }
    }
}
