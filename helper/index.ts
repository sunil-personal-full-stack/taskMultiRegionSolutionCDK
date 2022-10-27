export const dummyApplicationUser = [
  {
    name: "Sunil",
    role: "admin",
    user_id: "92633e3a-53db-11ed-bdc3-0242ac120002",
    api_key: "7c158f3d-7fd1-49c3-a73c-eccb5dac1555",
  },
  {
    name: "Anil",
    role: "member",
    user_id: "a5ce43f2-53db-11ed-bdc3-0242ac120002",
    api_key: "07916ea7-e7ca-4f23-ae10-38831ca5f68b",
  },
  {
    name: "Ajay",
    role: "member",
    user_id: "a5ce43f2-53db-11ed-bdc3-0242ac120002",
    api_key: "f81df3e5-a3af-45e8-9817-ce751b51b5dd",
  },
];


export const getUserRole = (apiKey: string): string => {
    let role = 'member';
    dummyApplicationUser.forEach(element => {
        if (element.api_key === apiKey) {
            role = element.role
        }
    });

    return role;
}


export const CustomValidatorType = {
  STRING: 'string',
  DATE: 'date'
}

export const OtherValidationTypes = {
  MINIMUM_CHARACTERS: 'minimum',
  MAXIMUM_CHARACTERS: 'maximum',
  REGEX: 'regex'
}


export interface ValidationConfig {
  type: String;
  message?: String;
  required?: boolean;
  regex?: string;
  regexFlag?: string;
  limit?: number;
  shouldMatch?: boolean;
  otherValidations?: ValidationConfig[] | null;
}

export interface SuperValidationConfig {
  [key: string]: ValidationConfig
}


export const validateObject = (inputObject: any, validationConfig: SuperValidationConfig) => {
  let errors: String[] = [];
  
  // EXTRA KEYS PROVIDED
  if (Object.keys(inputObject).length > Object.keys(validationConfig).length) {
    let extraFields: string[] = [];

    Object.keys(inputObject).forEach(key => {
      if (!Object.keys(validationConfig).includes(key)) {
        extraFields.push(key);
      }
    })

    errors.push('Extra field provided in required ' + extraFields.join(', '))
  }

  // OTHER VALIDATIONS
  Object.keys(validationConfig).forEach(key => {
    let value: ValidationConfig = validationConfig[key];
    let isValid = true;
    if (value.required && !inputObject[key]) {
      isValid = false;
      errors.push(value.message || 'Required parameter missing ' + key);
    }
    
    if (isValid) {
      let currentValue = inputObject[key];

      if (value.type === CustomValidatorType.STRING) {
        if (typeof currentValue !== 'string') {
          errors.push(value.message || `Parameter ${key} must be as string`)
        } else {
          if (value.otherValidations) {
            value.otherValidations.forEach(currentOtherValidation => {
              subValidation(key, currentValue, currentOtherValidation, errors);

            })
          }
        }
      }
    }
  });


  return errors;
}

const subValidation = (key: string, value: any, validationConfig: ValidationConfig, errors: String[]) => {
  if (validationConfig.type === OtherValidationTypes.MINIMUM_CHARACTERS) {
    if (value.length < (validationConfig.limit || 0)) {
      errors.push(validationConfig.message || 'Invalid provided for parameter ' + key);
    }
  }

  if (validationConfig.type === OtherValidationTypes.MAXIMUM_CHARACTERS) {
    if (value.length > (validationConfig.limit || 0)) {
      errors.push(validationConfig.message || 'Invalid provided for parameter ' + key);
    }
  }

  // VALIDATION FOR REGEX, IN THIS VALIDATION WE NEED TO WHETHER DATA SHOULD SATISFY REX OR NOT
  if (validationConfig.type === OtherValidationTypes.REGEX) {
    let regex = new RegExp((validationConfig.regex || ''), (validationConfig.regexFlag || 'i'));
    if (validationConfig.shouldMatch && !regex.test(value)) {
      errors.push(validationConfig.message || `Invalid value given for parameter ${key}`);
    }

    if (!validationConfig.shouldMatch && regex.test(value)) {
      errors.push(validationConfig.message || `Invalid value given for parameter ${key}`);
    }
  }
}

export const getRequestParameters = (event: any) => {
  let response: any = {};
  
  if (event['resource'] && event['path']) {
    let resourceParts = event['resource'].split('/');
    let pathParts = event['path'].split('/');
    
    if (resourceParts.length === pathParts.length) {
      for (let i = 0; i < resourceParts.length; i++) {
        if (resourceParts[i].includes('{')) {
          let currentKey: string = resourceParts[i];
          currentKey = currentKey.replace('{', '');
          currentKey = currentKey.replace('}', '');

          response[currentKey] = pathParts[i];
        } 
      }
    }
  }

  return response;
}