export function sendError(
    status: number,
    code: string,
    message: string,
) {
    return Response.json(
        {
            error: {
                code,
                message,
            },
        },
        { status }
    );
}
