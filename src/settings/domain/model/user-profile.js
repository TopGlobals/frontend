export class UserProfile {
  constructor({
    name = 'Dr. Alex Vance',
    email = 'alex.vance@topglobals.com',
    role = 'Head Researcher',
  } = {}) {
    this.name = name;
    this.email = email;
    this.role = role;
  }

  static fromJSON(data) {
    return new UserProfile(data);
  }
}
