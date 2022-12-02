export class IsAcceptableCatImageError extends Error {
  constructor(error?: string) {
    super(error);
    this.name = new.target.name;
  }
}
