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

export function sendSuccess<T>(data: T, status = 200) {
    return Response.json(data, { status });
}

export function sendPaginated<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number,
) {
    return Response.json({
        data,
        meta: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        },
    });
}

/** Parse ?limit and ?offset from a URL with sensible defaults and a max cap. */
export function parsePagination(url: URL, defaultLimit = 20, maxLimit = 100) {
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? String(defaultLimit), 10), maxLimit);
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
    return { limit: isNaN(limit) ? defaultLimit : limit, offset: isNaN(offset) ? 0 : offset };
}
