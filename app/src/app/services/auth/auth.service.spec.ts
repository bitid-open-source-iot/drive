import { TestBed } from '@angular/core/testing';

import { AuthManager } from './auth.service';

describe('AuthManager', () => {
  let service: AuthManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});