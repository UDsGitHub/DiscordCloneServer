export class AppUser {
  id: string;
  email: string;
  displayName: string;
  username: string;
  birthdate: Date;

  constructor(
    id: string,
    email: string,
    displayName: string,
    username: string,
    birthdate: string
  ) {
    this.id = id;
    this.email = email;
    this.displayName = displayName;
    this.username = username;
    this.birthdate = new Date(birthdate);
  }

  toString(): Record<string, string> {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      username: this.username,
      birthdate: this.birthdate.toISOString(),
    };
  }
}
