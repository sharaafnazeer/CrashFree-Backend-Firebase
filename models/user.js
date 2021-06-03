class User {
  constructor (firstName, lastName, email, password, phone, address, 
    status, lastLocation, driving, firebaseToken) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.email = email;
      this.password = password;
      this.phone = phone;
      this.address = address;
      this.status = status;
      this.lastLocation = lastLocation;
      this.driving = driving;
      this.firebaseToken = firebaseToken;
  }
  setId(id) {
    this.id = id;
  }
  getId() {
      return this.id;
  }
  getObject() {
      return Object.assign({}, this);
  }
}

module.exports = User;