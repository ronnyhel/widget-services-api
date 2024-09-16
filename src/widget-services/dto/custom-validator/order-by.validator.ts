import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidOrderByConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [allowedFields] = args.constraints;

    // If orderBy is not provided, it's valid since it's optional
    if (value === undefined || value === null) {
      return true;
    }

    if (typeof value === 'string') {
      return allowedFields.includes(value); // If it's a string, check if it's in allowedFields
    }

    if (Array.isArray(value)) {
      // If it's an array, ensure every value is in allowedFields
      return value.every((item) => allowedFields.includes(item));
    }

    return false; // If it's neither string nor array, return false
  }

  defaultMessage(args: ValidationArguments) {
    const [allowedFields] = args.constraints;
    return `orderBy must be a string or an array containing only: ${allowedFields.join(', ')}`;
  }
}

// Custom decorator to accept allowedFields and handle optional/default behavior
export function IsValidOrderBy(allowedFields: string[], validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [allowedFields],  // Pass allowedFields as constraint to the validator
      validator: IsValidOrderByConstraint,
    });
  };
}
