export function getErrorMessage( error: string, params: any = {} ) {
    if ( error === "required") {
        return `${params["name"]} is required`
    } else if ( error === "minLength") {
        return `${params["name"]} must have at least ${params["value"]} characters`
    } else if ( error === "passwordConfirm") {
        return `Password must be equal to new password`
    } else if ( error === "email" ) {
        return `Enter a valid email address`
    } else if ( error === "wrongValue" ) {
        return `${params["name"]} is wrong`
    }

    return ""
  }
