type RouteContextLike = {
    params?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
} | null | undefined;

export async function getRouteParams(context: RouteContextLike) {
    if (!context?.params) {
        return {} as Record<string, string | string[] | undefined>;
    }

    return (await context.params) || {};
}

export function getSingleParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

