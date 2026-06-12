const CRLF = "\r\n";

export function encodeSimple(value: string): string {
  return `+${value}${CRLF}`;
}

export function encodeError(value: string): string {
  return `-${value}${CRLF}`;
}

export function encodeBulk(value: string | null | undefined): string {
  if (value == null) {
    return `$-1${CRLF}`;
  }

  return `$${value.length}${CRLF}${value}${CRLF}`;
}

export function encodeNumber(value: number): string
{
  return `+${value}${CRLF}`
}