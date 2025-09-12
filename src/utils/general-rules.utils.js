


export function ageValidation(value, helper) {
    const { minAge, maxAge } = helper.state.ancestors[0];

    if (minAge !== undefined && value <= minAge) {
        return helper.message(`Age must be greater than min age (${minAge})`);
    }

    if (maxAge !== undefined && value >= maxAge) {
        return helper.message(`Age must be less than max age (${maxAge})`);
    }

    if (value <= 0) {
        return helper.message("Age must be positive");
    }

    return value;
}
