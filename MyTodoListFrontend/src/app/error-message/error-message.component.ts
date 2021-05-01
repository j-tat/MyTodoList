import { Component, OnInit } from '@angular/core';
import { ErrorMessageService } from '../error-message.service';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent implements OnInit {
  message: string;
  animate: boolean = false;
  
  constructor(private errorMessageService: ErrorMessageService) { }

  ngOnInit(): void {
    this.errorMessageService.message.subscribe(msg => {
      this.message = msg;

      if(msg == "") {
        this.animate = false;
      }
      else {
        this.animate = true;
      }
    });
  }

  onXButtonClick() {
    this.errorMessageService.setMessage("");
  }
}
