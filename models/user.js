const bcrypt = require('bcrypt');

class User {
  constructor (firstName, lastName, email, password, phone, address, 
    status, lastLocation = {}, driving = false, firebaseToken = '') {
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
  setEmail(email) {
    this.email =email;
  }
  getEmail () {
    return this.email;
  }
  setPassword(password) {
    this.password = password
  }
  getPassword() {
    return this.password;
  }
  setStatus(status) {
    this.status = status
  }
  getStatus() {
    return this.status;
  }
  getObject() {
      return Object.assign({}, this);
  }
}

module.exports = User;