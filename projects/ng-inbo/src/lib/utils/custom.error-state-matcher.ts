import {ErrorStateMatcher} from '@angular/material/core';

export class CustomErrorStateMatcher implements ErrorStateMatcher {

  constructor(private matcher: () => boolean) {
  }

  isErrorState(): boolean {
    return this.matcher();
  }

}
