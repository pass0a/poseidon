export class inputStream {
	on(ev: string, cb: (data: any) => void): void;
	push(buf: any): void;
}
export class outputStream {
	on(ev: string, cb: (data: any) => void): void;
	push(buf: any): void;
}
