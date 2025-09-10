export function wait(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}
