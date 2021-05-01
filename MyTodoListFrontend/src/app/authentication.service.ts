import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from './user';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private apiUrl: string = environment.API_URL;

    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true
      };

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${this.apiUrl}/users/authenticate`, { username, password }, this.httpOptions)
            .pipe(
                map(user => {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    console.log(user);
                    this.currentUserSubject.next(user);
                    return user;
                }),
                catchError(error => {
                    return this.handleError(error)
                }));
    }

    register(username: string, password: string) {
        return this.http.post<any>(`${this.apiUrl}/users/register`, { username, password }, this.httpOptions).pipe(
            catchError(error => this.handleError(error))
        );
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    private handleError(error: HttpErrorResponse) {
        let errorCode = 0;
        let errorMessage = "";
        if(error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
          errorCode = 0;
        }
        else {
          errorMessage = error.error;
          errorCode = error.status;
        }
    
        let returnError = {
          'statusCode': errorCode,
          'message': errorMessage
        }
    
        return throwError(returnError);
      }
}
