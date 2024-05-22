export function getUtcDate(): Date {
  return new Date(new Date().toUTCString());
}
