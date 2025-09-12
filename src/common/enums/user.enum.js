
export const genderEnum = {
    FEMALE: "female",
    MALE: "male"
}

export const roleEnum = {
    USER: "user",
    ADMIN: "admin"
}

export const privillages = {
    ADMIN: [roleEnum.ADMIN],
    USER: [roleEnum.USER],
    ALL: [roleEnum.ADMIN, roleEnum.USER]
}