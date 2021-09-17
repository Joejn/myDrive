import { Directive, Input } from '@angular/core';
import { AbstractControl, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

export function forbiddenNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // regex: https://stackoverflow.com/questions/11794144/regular-expression-for-valid-filename
    const forbiddenName = /^(?![\w\-. ]+$)/
    const forbidden = forbiddenName.test(control.value)
    return forbidden ? { forbiddenName: { value: control.value } } : null
  }
}

@Directive({
  selector: '[appForbiddenFilename]'
})
export class ForbiddenFilenameDirective implements Validator {

  constructor() { }

  public validate(control: AbstractControl): ValidationErrors | null {
    return forbiddenNameValidator()(control)
  }

}
