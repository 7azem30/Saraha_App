

const reqKeys = ['body', 'params', 'query', 'headers']
export const validationMiddleware = (schema) => {
    const validationErrors = [];
    return (req, res, next) => {
        for (const key of reqKeys) {
            if (schema[key]) {
                const {error} = schema[key].validate(req[key])
                if (error) {
                    validationErrors.push(...error.details)
                }
            }
        }
        if (validationErrors.length) {
            return res.status(400).json({ message: "Validation failed", error: validationErrors })
        }
        next()

    }
}