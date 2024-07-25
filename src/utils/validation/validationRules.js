// utils/validators/validationRules.js

import { validateEmail, validatePhoneNumber, validateRequired } from "./validationFunction";

export const allValidationRules = {
    name: {
        message: 'Please enter the Name',
        validate: validateRequired,
    },
    address: {
        message: 'Please enter the Address',
        validate: validateRequired,
    },
    phoneNumber: {
        message: 'Please enter a valid phone number',
        validate: value => !value || validatePhoneNumber(value),
    },
    emailAddress: {
        message: 'Please enter a valid email address',
        validate: value => !value || validateEmail(value),
    },
    source: {
        message: 'Please select the Source',
        validate: validateRequired,
    },
    // Add other fields as needed
};
