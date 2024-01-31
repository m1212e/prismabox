export interface Wrapped {
	opener: string;
	closer: string;
}

export function wrappedIfTrue({
	condition,
	opener,
	closer,
}: { condition: boolean; opener: string; closer: string }): Wrapped {
	if (!condition) {
		return { opener: "", closer: "" };
	}
	return { opener, closer };
}
