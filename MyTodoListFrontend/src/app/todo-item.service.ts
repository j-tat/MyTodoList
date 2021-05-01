import { Injectable } from '@angular/core';
import { TodoItem } from './to-do-item';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoItemService {
  private todoItemsUrl = environment.API_URL + '/todoitem';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true
  };

  constructor(private httpClient: HttpClient) {
  }

  getTodoItems(): Observable<TodoItem[]> {
    return this.httpClient.get<TodoItem[]>(this.todoItemsUrl, this.httpOptions).pipe(
      catchError(err => this.handleError(err))
    );
  }

  updateTodoItem(item: TodoItem): Observable<any> {
    return this.httpClient.put(this.todoItemsUrl + `/${item.id}`, item, this.httpOptions).pipe(
      catchError(err => this.handleError(err))
    );
  }

  postTodoItem(item: TodoItem){
    return this.httpClient.post(this.todoItemsUrl, item, this.httpOptions).pipe(
      catchError(err => this.handleError(err))
    );
  }

  updateList(items: TodoItem[]) {
    return this.httpClient.put(this.todoItemsUrl, items, this.httpOptions).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorCode = 0;
    let errorMessage = "";
    if(error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
      errorCode = 0;
    }
    else {
      errorMessage = error.message;
      errorCode = error.status;
    }

    let returnError = {
      'statusCode': errorCode,
      'message': errorMessage
    }

    return throwError(returnError);
  }

}
