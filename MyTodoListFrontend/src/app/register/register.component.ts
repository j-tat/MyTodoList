import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { mergeMap } from 'rxjs/operators'
import { ErrorMessageService } from '../error-message.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService
    ) { }

  username: string = "";
  password: string = "";

  ngOnInit(): void {
  }

  onRegisterClick() {
    this.authenticationService.register(this.username, this.password).pipe(
      mergeMap(result => this.authenticationService.login(this.username, this.password))
    ).subscribe(() => this.router.navigate(['/list']), error => {
      if(error.statusCode == 0) {
        this.errorMessageService.setMessage("Unable to connect to server. Please try again later.")
      }
      else {
        this.errorMessageService.setMessage(error.message);
      }
    });
  }

  handleKeyUp(event) {
    if(event.key == "Enter") {
      this.onRegisterClick();
    }
  }

}
