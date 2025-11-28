export function removeUndefined(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => removeUndefined(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const value = removeUndefined(obj[key]);
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);
    }
    return obj;
}
