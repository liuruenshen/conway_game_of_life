export async function isPromisePending(promise: Promise<unknown>) {
  try {
    await Promise.race([promise, Promise.reject(new Error('PENDING'))]);
  } catch (e) {
    if (e instanceof Error && e.message === 'PENDING') {
      return true;
    }
  }

  return false;
}
