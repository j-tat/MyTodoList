import { TestBed } from '@angular/core/testing';
import { TodoItemService } from './todo-item.service';

describe('TodoItemService', () => {
  let httpClientSpy: { get: jasmine.Spy };
  let service: TodoItemService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'put', 'post']);
    service = new TodoItemService(httpClientSpy as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
