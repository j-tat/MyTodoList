import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { ErrorMessageService } from './error-message.service';
import { User } from './user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = "To-Do List App"
  currentUser: User;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
  }

  onLogoutClick() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  shouldDisplayLoginButton() {
    var user = this.authService.currentUser;
    if(user == null) {
      return true;
    }
    return false;
  }

  onRegisterClick() {
    this.router.navigate(['/register']);
  }
}
