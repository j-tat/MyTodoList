import { Component, OnInit } from '@angular/core';
import { TodoItem } from '../to-do-item';
import { TodoItemService } from '../todo-item.service';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { ErrorMessageService } from '../error-message.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.css']
})
export class TodoListComponent implements OnInit {
  items: TodoItem[];
  dragged: TodoItem;
  isLoading: boolean = true;
  isError: boolean = false;

  constructor(
    private todoItemService: TodoItemService, 
    private authenticationService: AuthenticationService, 
    private router: Router,
    private errorMessageService: ErrorMessageService
    ) { }

  ngOnInit(): void {
    if(!(this.authenticationService.currentUserValue)) {
      this.router.navigate(['/login']);
    }

    this.getTodoItems();
  }

  getTodoItems(): void {
    this.todoItemService.getTodoItems().subscribe(items => {
      this.items = items;
      this.isLoading = false;
      this.isError = false;
    }, error => {
      this.isError = true;
      if(error.statusCode == 0) {
        this.errorMessageService.setMessage("Unable to connect to server. Please try again later.")
        this.isLoading = false;
      }
      else {
        this.errorMessageService.setMessage(`${error.statusCode}: ${error.message}`)
      }
    });
  }

  onTodoItemClick(item: TodoItem) {
    item.isCompleted = !item.isCompleted;
    this.todoItemService.updateTodoItem(item).subscribe(() => {}, error => {
      if(error.statusCode == 0) {
        this.errorMessageService.setMessage("Unable to connect to server. Please try again later.")
      }
      else {
        this.errorMessageService.setMessage(`${error.statusCode}: ${error.message}`)
      }
    });
  }

  handleKeyUp(event) {
    if(event.key == "Enter") {
      let newItem: TodoItem = {
        id: 0,
        isCompleted: false,
        description: event.target.value,
        isActive: true,
        sortRank: 0
      }
      this.todoItemService.postTodoItem(newItem).subscribe(data => {
        this.items.push(data as TodoItem);
      }, error => {
        if(error.statusCode == 0) {
          this.errorMessageService.setMessage("Unable to connect to server. Please try again later.")
        }
        else {
          this.errorMessageService.setMessage(`${error.statusCode}: ${error.message}`)
        }
      });
      event.target.value = ""; 
    }
  }

  onXButtonClick(item : TodoItem) {
    item.isActive = false;
    this.todoItemService.updateTodoItem(item).subscribe(() => {
      this.items = this.items.filter(x => x.id != item.id)
    }, error => {
      if(error.statusCode == 0) {
        this.errorMessageService.setMessage("Unable to connect to server. Please try again later.")
      }
      else {
        this.errorMessageService.setMessage(`${error.statusCode}: ${error.message}`)
      }
    });
  }

  onListItemDrag(item) {
    this.dragged = item;
  }

  onListItemDragOver(dropped: TodoItem) {
    //get indices
    let droppedIndex = this.items.findIndex(x => x.id == dropped.id);
    let draggedIndex = this.items.findIndex(x => x.id == this.dragged.id);
    
    if(draggedIndex == droppedIndex) {
      return;
    }

    let newRank = this.newSortRank(droppedIndex);

    if((dropped.sortRank - newRank) < 5) { //reset all sort ranks
      this.resetSortRanks();
      newRank = this.newSortRank(droppedIndex);
      this.dragged.sortRank = newRank;
      this.todoItemService.updateList(this.items).subscribe(() => {}, error => {
        if(error.statusCode == 0) {
          this.errorMessageService.setMessage("Unable to connect to server. Please try again later.")
        }
        else {
          this.errorMessageService.setMessage(`${error.statusCode}: ${error.message}`)
        }
      });
    }
    else { //update single sort rank
      newRank = this.newSortRank(droppedIndex);
      this.dragged.sortRank = newRank;
      this.todoItemService.updateTodoItem(this.dragged).subscribe(() => {}, error => {
        if(error.statusCode == 0) {
          this.errorMessageService.setMessage("Unable to connect to server. Please try again later.")
        }
        else {
          this.errorMessageService.setMessage(`${error.statusCode}: ${error.message}`)
        }
      });
    }

    this.items.splice(draggedIndex, 1);
    this.items.splice(droppedIndex, 0, this.dragged);

    console.log(this.items);
  }

  newSortRank(droppedIndex) : number{
    //get sortRank lower bound
    let lower = 0;
    if(droppedIndex > 0)
    {
      lower = this.items[droppedIndex - 1].sortRank;
    }

    //get sortRank upperBound
    let upper = this.items[droppedIndex].sortRank;

    let newRank = Math.floor((upper + lower) / 2);
    return newRank;
  }

  resetSortRanks() {
    let curRank = 1000;
    for(let i = 0; i < this.items.length; ++i) {
      this.items[i].sortRank = curRank;
      curRank += 1000;
    }
  }
}
