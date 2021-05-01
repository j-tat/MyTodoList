import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  messageSubject: BehaviorSubject<string>;
  message: Observable<string>;
  

  constructor() {
    this.messageSubject = new BehaviorSubject<string>("");
    this.message = this.messageSubject.asObservable();
  }

  public get messageValue() {
    return this.messageSubject.getValue();
  }

  setMessage(message: string) {
    this.messageSubject.next(message);
  }
}
