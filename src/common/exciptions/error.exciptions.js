
export const errorResponse = ({
    status = 400,
    message = 'something went wrong',
    extra = undefined
} = {}) => {
    throw new Error(message, { cause: { status, extra } })
}



export const badRequestException = ({ message = "bad request", extra } = {}) => {
    return errorResponse({ status: 400, message, extra })
}

export const unauthorizedException = ({ message = 'unauthorized  error', extra } = {}) => {
    return errorResponse({ status: 401, message, extra })
}

export const notFoundException = ({ message = "not found", extra } = {}) => {
    return errorResponse({ status: 404, message, extra })
}

export const conflicException = ({ message = 'conflict error', extra } = {}) => {
    return errorResponse({ status: 409, message, extra })
}

export const forbiddenException = ({ message = "You are not authorized to respond to this identity request", extra } = {}) => {
    return errorResponse({ status: 403, message, extra })
}
