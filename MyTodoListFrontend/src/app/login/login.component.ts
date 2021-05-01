import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { ErrorMessageService } from '../error-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string = "";
  password: string = "";

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private errorMessageService: ErrorMessageService
  ) { }

  ngOnInit(): void {
  }

  onLoginClick() {
    this.authenticationService.login(this.username, this.password)
      .subscribe(() =>  {
        this.router.navigate(['/list'])
      }, error => {
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
      this.onLoginClick();
    }
  }

}
