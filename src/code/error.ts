import wX from "./wX";

interface IServerError {
  code: number;
  text: string;
  error?: string;
}

// no stacktrace error
export class ServerError implements IServerError {
  code: number;
  text: string;
  error?: string;

  constructor(obj: IServerError) {
    this.code = obj.code;
    this.text = obj.text;
    this.error = obj.error;
  }

  toString() {
    switch (this.code) {
      case 401:
        if (this.error)
          return wX("NOT LOGGED IN", this);
        return wX("NOT LOGGED IN SHORT");
      case 403:
        if (this.error)
          return wX("PERM DENIED", this);
        return wX("PERM DENIED SHORT");
      case 410:
        if (this.error)
          return wX("NO LONGER AVAILABLE", this);
        return wX("NO LONGER AVAILABLE SHORT");
      case 412:
        // for internal use only
        if (this.error)
          return 'Mismatch version: ' + this.error;
        return 'Mismatch version';
      default:
        if (this.error)
          return this.text + ': ' + this.error;
        return this.text;
    }
  }
}
