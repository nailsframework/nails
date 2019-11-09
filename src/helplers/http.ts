class RestForm {
  public object: any;
  public xhr: any;
  public methods: any;
  public isArray: any;
  public url: any;

  constructor(object: any) {
    this.xhr = new XMLHttpRequest(); // the constructor has no arguments

    if (object.hasOwnProperty("methods")) {
      if (Array.isArray(object.methods)) {
        for (const methode of object.methods) {
          this.methods = [];
          this.methods.push(methode);
        }
      }
    }
    if (object.hasOwnProperty("isArray")) {
      this.isArray = object.isArray;
    }
    if (object.hasOwnProperty("url")) {
      this.url = object.url;
    }
  }

  // tslint:disable: no-empty
  public save(data: any) {}
  public update(data: any) {}
  // tslint:disable-next-line: ban-types
  public get(callback: Function, user: string, password: string) {
    // Assume, that the url is correct and the dev follows RFC we can just do a GET on this.
    this.xhr.open(
      "GET",
      this.url,
      false,
      user ? user : undefined,
      password ? password : undefined
    );
    this.xhr.send();
    this.xhr.onreadystatechange = function() {
      if (this.xhr.readyState === 4 && this.xhr.status === 200) {
        console.error(this.xhr.responseText);
      }
    };
  }
  public getOne(descriptor: string) {}
}
